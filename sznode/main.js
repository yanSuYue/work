const pool = require('./mysql.js').pool()
const util = require('util')

function queryUser(){
	return new Promise((resolve,reject)=>{
		pool.query('select * from ROMS_LOGIN',(err,rows,field)=>{
			if(err)reject(err);
			resolve(rows)
		})
	})
}


async function waiting(){
	let row = await queryUser()
	console.log('kkkk')
	setTimeout(()=>console.log(row),10000)
}

waiting()