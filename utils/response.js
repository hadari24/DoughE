// utils/response.js

function success(res, data, statusCode = 200) {
  // send a successful response in the format { success: true, data: ..., error: null }
  return res.status(statusCode).json({
    success: true,
    data: data,
    error: null
  });
}

function error(res, code, message, details = {}, statusCode = 400) {
  // send an error response in the format { success: false, data: null, error: { code, message, details } }
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message, details }
  });
}

module.exports = { success, error };
