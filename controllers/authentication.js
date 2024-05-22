const { prisma } = require("../config/db");
const bcrypt = require("bcrypt");
const { sendToken } = require("../utils/sendToken");
const { matchPassword } = require("../utils/matchPassword");
const OTPAuth = require("otpauth");
const encode = require("hi-base32");
const crypto = require("crypto");
const QRCode = require("qrcode");
require("dotenv").config();

const register = async (req, res, next) => {
  try {
    let { username, name, password } = req.body;

    if (!name || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Please provide the valid input fields",
      });
    }

    let user = await prisma.user.findFirst({ where: { username: username } });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User with the username already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        name: name,
        password: password,
        username: username,
      },
    });

    await sendToken(username, 201, res);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error occurred" });
  }
};

const login = async (req, res, next) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide the valid inputs" });
    }
    const user = await prisma.user.findFirst({ where: { username: username } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await matchPassword(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password did not match" });
    }

    await sendToken(username, 200, res);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error occurred" });
  }
};

const enableTwoWayAuthentication = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await prisma.user.findFirst({ where: { username: username } });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user with that email exists",
      });
    }

    const base32_secret = generateBase32Secret();

    let totp = new OTPAuth.TOTP({
      issuer: "localhost",
      label: "localhost",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    let otpauth_url = totp.toString();

    await prisma.user.update({
      where: { username: username },
      data: {
        otp_auth_url: otpauth_url,
        secret: base32_secret,
      },
    });

    let qrurl = QRCode.toFile("qrcode.png", otpauth_url, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("QR code saved as qrcode.png");
      }
    });

    return res.status(200).json({
      base32: base32_secret,
      otpauth_url: otpauth_url,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const verify2fa = async (req, res, next) => {
  try {
    const { username, token } = req.body;

    const message = "Token is invalid or user doesn't exist";

    const user = await prisma.user.findFirst({ where: { username: username } });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    let totp = new OTPAuth.TOTP({
      issuer: "localhost",
      label: "localhost",
      algorithm: "SHA1",
      digits: 6,
      secret: user.secret,
    });

    let delta = totp.validate({ token });

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: {
        otp_enabled: true,
        otp_verified: true,
      },
    });

    return res.status(200).json({
      otp_verified: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        otp_enabled: updatedUser.otp_enabled,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const validateotp = async (req, res, next) => {
  try {
    const { username, token } = req.body;

    const message = "Token is invalid or user doesn't exist";

    const user = await prisma.user.findFirst({ where: { username: username } });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    let totp = new OTPAuth.TOTP({
      issuer: "localhost",
      label: "localhost",
      algorithm: "SHA1",
      digits: 6,
      secret: user.secret,
    });

    let delta = totp.validate({ token });

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    return res.status(200).json({
      otp_verified: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode.encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

module.exports = {
  register,
  login,
  enableTwoWayAuthentication,
  verify2fa,
  validateotp,
};
