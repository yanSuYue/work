  const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime

function islogin(obj){
	let sql = 'select * from ROMS_LOGIN where username = ? and pwd = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[obj.username,obj.pwd],(err,rows,field)=>{
			if(err)reject(err)
				console.log(rows)
			if(rows.length>0){
				rows[0].modList='all'
				resolve({msg:'登陆成功',admin:1,success:true,usertype:rows[0]})
			}else{
				let sql = `select * from ROMS_SZ_SYSTEMADMIN where name=? and pwd=?`
				pool.query(sql,[obj.username,obj.pwd],(err,rows,field)=>{
					if(err)reject(err)
						console.log(rows)
					if(rows.length>0){
						rows[0].modList='all'
						resolve({msg:'登陆成功',admin:1,success:true,usertype:rows[0]})
					}else{
						let sql = ` select  STAFF.staffName,STAFF.subCompanyId, STAFF.id as staffId,ROLE.modList from ROMS_SZ_STAFF 
						STAFF join ROMS_SZ_ROLE ROLE on ROLE.id=STAFF.roleId  where STAFF.staffPhone=? and STAFF.password=?`
						pool.query(sql,[obj.username,obj.pwd],(err,rows,field)=>{
							if(err)reject(err)
								console.log(rows)
							if(rows.length>0){
								resolve({msg:'登陆成功',admin:0,success:true,usertype:rows[0]})
							}else{
								resolve({msg:'账号或密码错误，请联系管理员',success:false})
							}
						})
					}
				})
			}
		})
	})
}

function updatepwd(obj,res){
	return new Promise((resolve,reject)=>{
		let sql = `select * from ROMS_SZ_STAFF  where id='${obj.staffId}' and password='${obj.oldpwd}'`
		console.log(sql)
		pool.query(sql,[],(err,rows,field)=>{
			if(err)reject(err)
				console.log(rows)
			if(rows.length>0){
				let sql=`update ROMS_SZ_STAFF set password='${obj.pwd}' where id = '${obj.staffId}'`
				console.log(sql)
				let promise=new Promise((resolve,reject)=>{
					pool.query(sql,(err,rows,field)=>{
						if(err)reject(err)
						res.json({msg:'修改密码成功',success:true})
					})
				})
			}else{
				res.json({msg:'原密码错误，请联系管理员',success:false})
			}
		})
	})
}
module.exports={islogin,updatepwd}
