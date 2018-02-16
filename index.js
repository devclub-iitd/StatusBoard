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


function pingTest(req,res){
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
            utils.res(res,500,"Internal Server Error");
        }
        else{
            utils.res(res,200,response);
        }
    })
}

function statusTest(req,res){
    response = {}
    function statusHost(host,callback){
        request('http://'+ host,function(err,resp,data){
            response[host] = resp.statusCode;
            callback();
        });
    }
    async.each(hosts,statusHost,function(err){
        if(err){
            utils.res(res,500,"Internal Server Error");
        }
        else{
            utils.res(res,200,response);
        }
    })
}



app.get('/pingTest',pingTest);
app.get('/statusTest',statusTest);

app.listen(3000, () => console.log('Example app listening on port 3000!'))