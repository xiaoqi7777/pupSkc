const config = require('config');
console.log(`${config.db.dialect}://${config.db.username}:${config.db.password}@${config.db.host}/${config.db.database}`);
