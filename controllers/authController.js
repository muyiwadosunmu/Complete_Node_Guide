const crypto = require("node:crypto");
const sendEmail = require("../util/email");
const bcrypt = require("bcryptjs");
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
    // isAuthenticated: false,
    // csrfToken: req.csrfToken(false),
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      req.flash("error", "Invalid Email or Password");
      return res.redirect("/login");
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.redirect("/login");
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
    console.log(err);
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

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a request with your new password and password Confirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

    await sendEmail({
      email: foundUser.email, //Or req.body.email
      subject: `Your password reset token - Valid for 10mins`,
      message,
    });

    //Email implementation here

    res.render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset Password",
      errorMessage: message,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/reset");
  }
};
