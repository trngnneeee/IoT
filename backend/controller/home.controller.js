module.exports.check = (req, res) => {
  return res.json({
    code: "success",
    message: "Token authentication successful!"
  })
}