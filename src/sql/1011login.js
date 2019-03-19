const Crypto = require('my-easy-crypto')
const cp = new Crypto()
const db = require('./connect.js')

async function login_check_admin(req,res){
	let params = req.body
	if(!params.usr||!params.pwd){
		res.json({success:false,msg:'参数不能为空'})
		return
	}
	let _sql = `select id,pwd from ROMS_LOGIN where username = ?`
	let _params = [params.usr]
	let back = await db.raw_select(_sql,_params)
	if(!back.success){
		res.json({success:false,msg:'没有此用户'})
		return
	}else{
		let raw_pwd = cp.hash('md5','hex',params.pwd)
		if(raw_pwd==back.result[0].pwd){
			req.session.regenerate((err)=>{
				if(err)throw err
				req.session.admin = back.result[0].id
				console.log(req.session.admin,'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
				req.session.fuck = 'fuck'
				console.log(req.session,'login')	
				res.json({success:true,msg:'验证成功',flag:'big'})			
			})
			
			//return
			
		}else{
			res.json({success:true,msg:'验证失败'})
			return
		}
	}
}

async function login_check_station(req,res){
	let params = req.body
	if(!params.usr||!params.pwd){
		res.json({success:false,msg:'参数不能为空'})
		return
	}
	let _sql = `select monstationId as id ,password from ROMS202_MONUSER where monuserPhone = ? and type = 1`
	let _params = [params.usr]
	let back = await db.raw_select(_sql,_params)
	if(!back.success){
		res.json({success:false,msg:'没有此用户'})
		return
	}else{
		let raw_pwd = cp.hash('md5','hex',params.pwd)
		console.log(raw_pwd)
		console.log(back.result[0].password)
		if(raw_pwd==back.result[0].password){
			req.session.regenerate((err)=>{
				if(err)throw err
				req.session.stationId = back.result[0].id
			req.session.fuck = 'fuck'
			console.log(req.session,'login')	
			res.json({success:true,msg:'验证成功',flag:'small'})			
			})
			
			//return
			
		}else{
			res.json({success:false,msg:'验证失败'})
			return
		}
	}
}

async function login_check_exam(req,res){
	let params = req.body
	if(!params.usr||!params.pwd){
		res.json({success:false,msg:'参数不能为空'})
		return
	}
	let _sql = `select password from ROMS202_MONUSER where monuserName = ? and type = 5`
	let _params = [params.usr]
	let back = await db.raw_select(_sql,_params)
	if(!back.success){
		res.json({success:false,msg:'没有此用户'})
		return
	}else{
		let raw_pwd = cp.hash('md5','hex',params.pwd)
		console.log(raw_pwd)
		console.log(back.result[0].password)
		if(raw_pwd==back.result[0].password){
			req.session.regenerate((err)=>{
				if(err)throw err
				req.session.excel = 'excel'
			console.log(req.session,'login')	
			res.json({success:true,msg:'验证成功',flag:'excel'})			
			})			
		}else{
			res.json({success:false,msg:'验证失败'})
			return
		}
	}
}

const login= {
	login_check_admin:login_check_admin,
	login_check_station:login_check_station,
	login_check_exam:login_check_exam
}
module.exports = login