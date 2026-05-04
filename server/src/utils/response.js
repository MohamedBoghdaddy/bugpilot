export const successResponse = (res, message, data = null, statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error: message });
};
