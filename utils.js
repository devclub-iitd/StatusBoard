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
  

module.exports = {
  'res': resp,
  'makeJSON' : makeJSON,
}