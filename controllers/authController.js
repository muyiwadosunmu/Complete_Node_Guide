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

    const result = await user.save();
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
