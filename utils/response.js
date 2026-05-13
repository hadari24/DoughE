// utils/response.js

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data: data,
    error: null
  });
}

function error(res, code, message, details = {}, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message, details }
  });
}

module.exports = { success, error };
