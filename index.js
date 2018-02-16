const express = require('express')
const bodyParser = require('body-parser');
var assert = require('assert');
var ping = require('ping');
var async = require('async');
var request = require('request');

var utils = require('./utils');

var hosts = ['devclub.in', 'join.devclub.in', 'devclub.cse.iitd.ac.in', 'fs.devclub.cse.iitd.ac.in'];

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
  next();
});

app.use(express.static('static'))

app.set('view engine', 'ejs');

function pingTest(next){
    response = {}
    function pingHost(host,callback){
        ping.promise.probe(host)
            .then(function (res) {
                response[host] = res.alive;
                callback();
        });
    }
    async.each(hosts,pingHost,function(err){
        if(err){
            next(utils.makeJSON(500,"Internal Server Error"));
        }
        else{
            next(utils.makeJSON(200,"Success",response));
        }
    });
}

function statusTest(next){
    response = {}
    function statusHost(host,callback){
        request('http://'+ host,function(err,resp,data){
            response[host] = resp.statusCode;
            callback();
        });
    }
    async.each(hosts,statusHost,function(err){
        if(err){
            next(utils.makeJSON(500,"Internal Server Error"));
        }
        else{
            next(utils.makeJSON(200,"Success",response));
        }
    });
}



app.get('/',function(req,res){
    pingTest(function(pingVal){
        statusTest(function(statusVal){
            res.render('index.ejs',{
                hosts: hosts,
                pingVal: pingVal.data,
                statusVal: statusVal.data
                }
            );
        });
    });
});


app.listen(3000, () => console.log('Example app listening on port 3000!'))