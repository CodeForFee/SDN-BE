const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  const hashed = await bcrypt.hash(password, 10);
  console.log(hashed);
}

hashPassword("123456");