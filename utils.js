const fs = require("fs");
const request = require("request");
const CONFIG_PATH = "./config.json";

function notifySlack(url, body) {
  var options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body,
    json: true
  };

  request(options, function (error, response, body) {
    if (error)
      console.log("Err: ", err);
  });
}

function resp(res, statusCode, msg, data = null) {
  try {
    return res.status(statusCode).json({
      'error': (statusCode === 200) ? false : true,
      'message': msg,
      'data': data
    });
  } catch (err) {
    console.log(err);
  }
}

function makeJSON(statusCode, msg, data = null) {
  return {
    'code': statusCode,
    'message': msg,
    'data': data
  };
}

function parseConfig() {
  let json = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return json;
}

module.exports = {
  'res': resp,
  'makeJSON': makeJSON,
  'parseConfig': parseConfig,
  'notifySlack': notifySlack
}