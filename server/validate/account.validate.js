const Joi = require('joi');

module.exports.registerPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .messages({
        "string.empty": "Full name required!"
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Email required!",
        "string.email": "Invalid email format!"
      }),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value))
          return helpers.error("password.uppercase");
        if (!/[a-z]/.test(value))
          return helpers.error("password.lowercase");
        if (!/\d/.test(value))
          return helpers.error("password.number");
        if (!/[@$!%*?&]/.test(value))
          return helpers.error("password.specialChar")
        return value;
      })
      .messages({
        "string.empty": "Password required!",
        "string.min": "Password must contain at least 8 characters!!",
        "password.uppercase": "Password must contain at least one uppercase letter!",
        "password.lowercase": "Password must contain at least one lowercase letter!",
        "password.number": "Password must contain at least one digit!",
        "password.specialChar": "Password must contain at least one special character!"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}

module.exports.loginPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Email required!",
        "string.email": "Invalid email format!"
      }),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value))
          return helpers.error("password.uppercase");
        if (!/[a-z]/.test(value))
          return helpers.error("password.lowercase");
        if (!/\d/.test(value))
          return helpers.error("password.number");
        if (!/[@$!%*?&]/.test(value))
          return helpers.error("password.specialChar")
        return value;
      })
      .messages({
        "string.empty": "Password required!",
        "string.min": "Password must contain at least 8 characters!!",
        "password.uppercase": "Password must contain at least one uppercase letter!",
        "password.lowercase": "Password must contain at least one lowercase letter!",
        "password.number": "Password must contain at least one digit!",
        "password.specialChar": "Password must contain at least one special character!"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}

module.exports.forgotPasswordPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Email required!",
        "string.email": "Invalid email format!"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}

module.exports.resetPasswordPost = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value))
          return helpers.error("password.uppercase");
        if (!/[a-z]/.test(value))
          return helpers.error("password.lowercase");
        if (!/\d/.test(value))
          return helpers.error("password.number");
        if (!/[@$!%*?&]/.test(value))
          return helpers.error("password.specialChar")
        return value;
      })
      .messages({
        "string.empty": "Password required!",
        "string.min": "Password must contain at least 8 characters!!",
        "password.uppercase": "Password must contain at least one uppercase letter!",
        "password.lowercase": "Password must contain at least one lowercase letter!",
        "password.number": "Password must contain at least one digit!",
        "password.specialChar": "Password must contain at least one special character!"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}

module.exports.otpPasswordPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Email required!",
        "string.email": "Invalid email format!"
      }),
    otp: Joi.string()
      .required()
      .min(6)
      .max(6)
      .messages({
        "string.empty": "OTP required!",
        "string.min": "OTP must contain 6 digit",
        "string.max": "OTP must contain 6 digit"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}