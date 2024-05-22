const { sendToken } = require("../utils/sendToken");
const { prisma } = require("../config/db");

const refreshToken = async (req, res, next) => {
  try {
    const { refresh } = req.body;
    const user = await prisma.user.findFirst({
      where: { refreshToken: refresh },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid refresh token" });
    }

    await sendToken(user.username, 200, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }
};

module.exports = { refreshToken };
