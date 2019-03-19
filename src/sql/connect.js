const database = require('async-mysql-query')
let obj = require('../config/mysql.js')
const db = new database(obj)

module.exports = db