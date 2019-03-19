var mysql=require('mysql')

var pool=function(){
  var connect=mysql.createPool({
    host:'118.178.18.106',
    user:'roms',
    password:'roms!118',
    database:'roms',
  })
  return connect
}

module.exports.pool=pool
