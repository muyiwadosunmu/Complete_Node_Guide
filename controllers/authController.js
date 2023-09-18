const crypto = require("node:crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const sendEmail = require("../util/email");
const User = require("../models/userModel");
const { getTokenFromRequest } = require("csrf-sync");

// const csrfSyncProtection = csrfSync({
//   getTokenFromRequest: (req) => {
//     return req.body["CSRFToken"];
//   }, // Used to retrieve the token submitted by the user in a form
// });

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
    // isAuthenticated: false,
    // csrfToken: req.csrfToken(false),
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
    // isAuthenticated: false,
    // csrfToken: req.csrfToken(false),
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/login", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
      // isAuthenticated: false,
      // csrfToken: req.csrfToken(false),
    });
  }

  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      req.flash("error", "Invalid Email or Password");
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid Email or Password",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
        // validationErrors: [{param:'email', param:}]
        // isAuthenticated: false,
        // csrfToken: req.csrfToken(false),
      });
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid Email or Password",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
      });
    }

    // Set session properties
    req.session.isLoggedIn = true;
    req.session.user = foundUser;

    // Save the session and redirect
    await req.session.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
      // isAuthenticated: false,
      // csrfToken: req.csrfToken(false),
    });
  }
  try {
    const userDoc = await User.findOne({ email: email });

    if (userDoc) {
      req.flash("error", "E-mail exists already, please use another one");
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });

    await user.save();
    const message = `Welcome ${user.email}\nYou successfully signed up`;
    await sendEmail({
      email: user.email, //Or req.body.email
      subject: `Signup Succeeded`,
      message,
    });

    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    //destroy is a method provided by the express-session package we're using
    // console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = async (req, res, next) => {
  try {
    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    const token = buffer.toString("hex");
    const foundUser = await User.findOne({ email: req.body.email }).exec();

    if (!foundUser) {
      req.flash("error", "No account with that email found");
      return res.redirect("/reset");
    }

    foundUser.resetToken = token;
    foundUser.resetTokenExpiration = Date.now() + 3600000; // 1hr
    await foundUser.save();

    const resetURL = `${req.protocol}://${req.get("host")}/reset/${token}`;
    const message = `Forgot your password?\n Click this link to set a new password : ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

    res.redirect("/");
    await sendEmail({
      email: foundUser.email, //Or req.body.email
      subject: `Your password reset token - Valid for 60mins`,
      message,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/reset");
  }
};

exports.getNewPassword = async (req, res, next) => {
  const { token } = req.params;

  const foundUser = await User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  });

  if (foundUser) {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      passwordToken: token,
      userId: foundUser._id.toString(), //we had to duplicate our hidden field in new-password.ejs
    });
    console.log(foundUser._id);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  try {
    const resetUser = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!resetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;

    await resetUser.save();
    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
