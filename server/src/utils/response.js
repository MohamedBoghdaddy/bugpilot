export const successResponse = (res, message, data = null, statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const payload = { success: false, error: message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
