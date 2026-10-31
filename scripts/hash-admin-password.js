const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'admin123';
bcrypt.hash(password, 10).then((hash) => {
  const escaped = hash.replace(/\$/g, '\\$');
  console.log('password:', password);
  console.log('Put this in .env.local (escaped for Next/dotenv):');
  console.log('ADMIN_PASSWORD_HASH=' + escaped);
});
