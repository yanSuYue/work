const mysql = require('mysql')

const pool = function(option){
	let opt = option || {}
	var connect=mysql.createPool({
		host:opt.host || '120.77.153.63',
		user:opt.user || 'roms',
		password:opt.password ||'roms!118',
		database:opt.database ||'roms'
	})
	return connect;
}
exports.pool=pool
//项目名---原始记录表编号----任务表项目编号---
