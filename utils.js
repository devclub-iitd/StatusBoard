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

module.exports = {
  'res': resp,
}