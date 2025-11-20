const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize'); // <-- import Op correctly
const models = require('../models');

async function createReset(email, baseUrl) {
  await models.init();
  const { User } = models;

  const user = await User.findOne({ where: { email } });
  if (!user) return false;
  console.lo
  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  user.reset_token = token;
  user.reset_expires = expires;
  await user.save();

  console.log(`Password reset link: ${baseUrl}/reset/${token}`);
  return true;
}

async function consumeToken(token, newPassword) {
  await models.init();
  const { User } = models;

  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_expires: { [Op.gt]: new Date() } // <-- now works
    }
  });

  if (!user) return null;

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.reset_token = null;
  user.reset_expires = null;
  await user.save();

  return user;
}

module.exports = { createReset, consumeToken };
