const express = require("express");
const { check, cookie, body } = require("express-validator");
const User = require("../models/userModel");

const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid E-mail address")
      .normalizeEmail(),
    body("password", "Password has to be valid")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.getLogin
);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  [
    // the custom validation here helps us to check for a user which we earlier implemented in the auth controller
    check("email")
      .isEmail()
      .withMessage("Please enter a valide Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail exists already, please pick a different one"
            );
          }
        });
      })
      .normalizeEmail(),
    // Below is how we write our own custom validators
    /**
     * .custom((value, { req }) => {
      if (value === "test@test.com") {
        throw new Error("This email address is forbidden");
      }
      return true
    })
     */
    body(
      "password",
      "Please enter a password with at least 5 characters and must contain only numbers and alphabets"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!!!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
