const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
require("dotenv").config();

const getSignedToken = async (username) => {
  const refresh_token = jwt.sign(
    { username: username },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: process.env.JWT_REFRESH_EXP }
  );
  const tokens = { refresh: refresh_token };
  const user = await prisma.user.update({
    where: { username: username },
    data: { refreshToken: refresh_token },
  });
  return tokens;
};

const sendToken = async (username, statusCode, res) => {
  const token = await getSignedToken(username);
  return res.status(statusCode).json({ success: true, refresh: token.refresh });
};

module.exports = { sendToken };
