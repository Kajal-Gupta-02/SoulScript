const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log("Usage: node scripts/hashPassword.js <my-password>");
  process.exit(1);
}

bcrypt.hash(plainPassword, 12).then((hash) => {
  console.log("\nAdd this line to your .env file:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
});
