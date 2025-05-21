const AdminAccount = require("../model/admin-account.model");
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
const ForgotPassword = require("../model/forgot-password.model");
const generateOTPHelper = require("../helper/generateOTP.helper");
const mailHelper = require("../helper/mail.helper");

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
      expiresIn: req.body.rememberPassword ? '30d' : '1d'
    }
  )

  res.cookie("token", token, {
    maxAge: req.body.rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
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

module.exports.forgotPasswordPost = async (req, res) => {
  const existAccount = await AdminAccount.findOne({
    email: req.body.email,
    status: "active",
    deleted: false
  });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email does not exist in the systems!"
    });
    return;
  }

  const existAccountForgotPassword = await ForgotPassword.findOne({
    email: req.body.email
  });
  if (existAccountForgotPassword) {
    res.json({
      code: "error",
      message: "Please try again after 5 minutes"
    });
    return;
  }
  const otp = generateOTPHelper(6);

  const newRecord = new ForgotPassword({
    email: req.body.email,
    otp: otp,
    expireAt: Date.now() + 5 * 60 * 1000
  });
  await newRecord.save();

  const subject = `Mã OTP lấy lại mật khẩu`;

  const content = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #2e6da4;">Khôi phục mật khẩu</h2>
    <p>Xin chào,</p>
    <p>Bạn vừa yêu cầu lấy lại mật khẩu. Đây là mã OTP của bạn:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 24px; font-weight: bold; color: green; background-color: #e1f3e1; padding: 10px 20px; border-radius: 5px;">${otp}</span>
    </div>
    <p><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    <p>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
    <hr style="margin: 30px 0;">
    <p style="font-size: 12px; color: #888;">Email này được gửi tự động, vui lòng không trả lời lại.</p>
  </div>
`;
  mailHelper.sendMail(req.body.email, subject, content);

  res.json({
    code: "success",
    message: "Send OTP successfully!"
  })
}

module.exports.otpPasswordPost = async (req, res) => {
  const existAccountOTP = await ForgotPassword.findOne({
    email: req.body.email,
    otp: req.body.otp
  });
  if (!existAccountOTP)
  {
    res.json({
      code: "error",
      message: "Incorrect OTP!"
    });
    return;
  }
  
  await ForgotPassword.deleteOne({
    email: req.body.email,
    otp: req.body.otp
  });

  const existAccount = await AdminAccount.findOne({
    email: req.body.email
  });

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
    message: "Verify OTP successfully!"
  });
}

module.exports.resetPasswordPost = async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(req.body.password, salt);

  await AdminAccount.updateOne({
    _id: req.account.id
  }, {
    password: hashPassword
  })
  
  res.json({
    code: "success",
    message: "Reset password successfully!"
  })
}