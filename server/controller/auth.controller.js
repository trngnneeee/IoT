const jwt = require("jsonwebtoken");
const AdminAccount = require("../model/admin-account.model");

module.exports.verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.json({
        code: "error",
        message: "Invalid Token!"
      });
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
    const { id, email } = decoded;

    const existAccount = await AdminAccount.findOne({
      _id: id,
      email: email
    });

    if (!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Email does not exist in the system!"
      });
      return;
    }

    const infoUser = {
      id: existAccount.id,
      email: existAccount.email,
      fullName: existAccount.fullName
    };

    res.json({
      code: "success",
      message: "Valid token!",
      infoUser: infoUser
    })
  }
  catch (error) {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Invalid Token!"
    });
  }
}