var jwt = require('jsonwebtoken');
const AdminAccount = require('../model/admin-account.model');

module.exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
  {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Token not provided!"
    });
    return;
  }
  try
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const { id, email } = decoded;

     const existAccount = await AdminAccount.findOne({
      _id: id,
      email: email,
      status: "active"
     });

     if (!existAccount)
     {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Email does not exist in the systems!"
      });
      return;
     }

     req.account = existAccount;
  }
  catch(error)
  {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Invalid token!"
    })
    return;
  }
  next();
}