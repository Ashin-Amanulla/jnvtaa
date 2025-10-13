export const sendSuccess = (res, statusCode, data, message = "Success") => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

export const sendPaginated = (
  res,
  statusCode,
  data,
  pagination,
  message = "Success"
) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
    pagination,
  });
};
