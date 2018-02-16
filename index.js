"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const assert = require('assert');
const ping = require('ping');
const async = require('async');
const request = require('request');
const utils = require('./utils');
const mailer = require("./mailer");

const PORT = process.env.PORT || 7000;

const CONFIG = utils.parseConfig();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    next();
});

app.use(express.static('static'));

app.set('view engine', 'ejs');

function pingTest(next) {
    function pingHost(host, callback) {
        ping.promise.probe(host.host)
            .then(function (res) {
                host.pingResponse = res.alive;
                callback();
            });
    }
    async.each(CONFIG.data, pingHost, function (err) {
        if (err) {
            next(utils.makeJSON(500, "Internal Server Error"));
        } else {
            next(utils.makeJSON(200, "Success", null));
        }
    });
}

function statusTest(next) {
    function statusHost(host, callback) {
        request(host.heartbeat, function (err, resp, data) {
            if(err) {
              callback(err);
            } else {
              host.heartbeatStatus = resp.statusCode;
              host.heartbeatData = data;
              callback();
            }
        });
    }
    async.each(CONFIG.data, statusHost, function (err) {
        if (err) {
            next(utils.makeJSON(500, "Internal Server Error"));
        } else {
            next(utils.makeJSON(200, "Success", null));
        }
    });
}

function notifyAll(next) {
    function checkAndNotify(host, callback) {
        let toNotify = false;
        if (host.heartbeatStatus != 200 || host.pingResponse != 200)
            toNotify = true;
        if (toNotify) {
            let subject = "StatusBoard: Alert! "+host.name+" is down";
            let body = "";
            body += "Ping Response: "+host.pingResponse+"\n";
            body += "Heartbeat Status: "+host.heartbeatStatus+"\n";
            body += "Heartbeat Response: "+host.heartbeatData+"\n";
            if(host.emails) {
                for(let i=0;i<host.emails.length;i++) {
                    mailer.sendMail(host.emails[i],"statusboard",subject,body);
                }
            }
            if(host.slackwebhook) {
                utils.notifySlack(host.slackwebhook,{text: subject+"\n\n"+body});
            }
            callback();
        } else {
            callback();
        }
    }
    async.each(CONFIG.data, checkAndNotify, function (err) {
        if (err) {
            console.log("Err: ", err);
        }
        console.log("Checked services at: ", new Date().toString());
        next();
    });
}

function periodicCheck() {
    console.log("Periodic Check started");
    pingTest(function (pingVal) {
        console.log("Status Check started");
        statusTest(function (statusVal) {
            console.log("Notfication Module started");
            notifyAll(function () {
                setTimeout(periodicCheck, 1000 * CONFIG.interval);
            });
        });
    });
}

app.get('/', function (req, res) {
    pingTest(function (pingVal) {
        statusTest(function (statusVal) {
            res.render('index.ejs', {
                hosts: CONFIG.data
            });
        });
    });
});

periodicCheck();
app.listen(PORT, () => console.log('Status board listening on port ' + PORT + '!'));
