const express = require("express");
const router = express.Router();

const {
  register,
  login,
  enableTwoWayAuthentication,
  verify2fa,
  validateotp,
} = require("../controllers/authentication");
const { refreshToken } = require("../controllers/refreshToken");
const { protect } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/enable2fa").post(protect, enableTwoWayAuthentication);
router.route("/verify2fa").post(verify2fa);
router.route("/validateotp").post(validateotp);

router.route("/refresh").post(refreshToken);

module.exports = router;
