const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = null, message = 'Created successfully') =>
  success(res, data, message, 201);

module.exports = { success, created };
