// One-off helper so the real admin password never has to sit in plain text
// anywhere, including in .env. Run it once, paste the output into
// ADMIN_PASSWORD_HASH, then forget the plain password ever touched a file.
//
// Usage: node scripts/hashPassword.js "yourRealPassword"

const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log("Usage: node scripts/hashPassword.js <your-password>");
  process.exit(1);
}

bcrypt.hash(plainPassword, 12).then((hash) => {
  console.log("\nAdd this line to your .env file:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
});
