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
				//新增用户session
				req.session.user = 'admin'
				console.log(req.session.admin,'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
				req.session.fuck = 'fuck'
				console.log(req.session,'login')
				res.json({success:true,msg:'验证成功',flag:'big',username:'admin'})
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
	let _sql = `select id,monuserName,monstationId as stationid ,password from ROMS202_MONUSER where monuserPhone = ? and type = 1`
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
				req.session.stationId = back.result[0].stationid
				req.session.user = back.result[0].id
				req.session.fuck = 'fuck'
				console.log(req.session,'login')
				res.json({success:true,msg:'验证成功',flag:'small',username:back.result[0].monuserName})
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
	let _sql = `select type,monuserPhone,id,monuserName,provinceId,monstationId,password,photoUrl from ROMS202_MONUSER where monuserPhone = ?`
	let _params = [params.account]
	let back = await db.raw_select(_sql,_params)
	if(!back.success){
		res.json({success:false,msg:'没有此用户'})
		return
	}else{
		let raw_pwd = cp.hash('md5','hex',params.pwd)
		if(raw_pwd==back.result[0].password){
			req.session.regenerate((err)=>{
				if(err)throw err
				req.session.photoUrl=back.result[0].photoUrl;
				req.session.user = back.result[0].id;
				req.session.provinceId = back.result[0].provinceId;
				req.session.monstationId = back.result[0].monstationId;
				req.session.monuserName = back.result[0].monuserName;
				req.session.monuserPhone = back.result[0].monuserPhone;
				req.session.user = back.result[0].id;
				req.session.type = back.result[0].type;
			res.json({
				success:true,
				msg:'验证成功',
				monuserPhone:back.result[0].monuserPhone,
				monuserName:back.result[0].monuserName,
				type:back.result[0].type,
			})
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
