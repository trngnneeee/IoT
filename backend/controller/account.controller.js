const AdminAccount = require("../model/admin-account.model");
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');

module.exports.registerPost = async (req, res) => {
  const existAccount = await AdminAccount.findOne({
    email: req.body.email
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email already exists in the systems!"
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(req.body.password, salt);
  req.body.password = hashPassword;

  req.body.status = "initial";

  const newRecord = new AdminAccount(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Register successfully!"
  })
}

module.exports.loginPost = async (req, res) => {
  const existAccount = await AdminAccount.findOne({
    email: req.body.email
  })

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Account does not exist in the system!"
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(req.body.password, existAccount.password);
  if (!isValidPassword) {
    res.json({
      code: "error",
      message: "Invalid password!"
    });
    return;
  }
  if (existAccount.status != "active") {
    res.json({
      code: "error",
      message: "Account haven't been approved!"
    });
    return;
  }

  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  )

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.json({
    code: "success",
    message: "Login successfully!"
  })
}