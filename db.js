const Sequelize = require('sequelize');
const config = require('config');

var sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    pool: {
      max: 5,
      min: 0,
      idle: 30000
    }
  });

let Files = sequelize.import(__dirname + "/models/file");

export { Files }
// exports.Service = sequelize.import(__dirname + "/models/service");