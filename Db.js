const Datastore = require('nedb');

const users = new Datastore({filename:'to/path/user.db', autoload: true});

users.loadDatabase();

module.exports = users;