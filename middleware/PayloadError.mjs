const payloadErrorHandler = (err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body exceeds the allowed size. Delete some cards or text."
    });
  }
}

export default payloadErrorHandler