const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'admin123';
bcrypt.hash(password, 10).then((hash) => {
  console.log('password:', password);
  console.log('ADMIN_PASSWORD_HASH=' + hash);
});
