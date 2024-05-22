const bcrypt = require("bcrypt");
const matchPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { matchPassword };
