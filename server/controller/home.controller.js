module.exports.check = (req, res) => {
  res.json({
    code: "success",
    message: "Verify token successfully!"
  });
}