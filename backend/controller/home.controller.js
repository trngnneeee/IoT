module.exports.home = (req, res) => {
  return res.json({
    code: "success",
    message: "Token authentication successful!"
  })
}