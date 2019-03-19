const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const Cp = require('my-easy-crypto')
const cp = new Cp()

//用于省一级的获取所有监测人员或管理信息
async function get_usr(req,res){
	//todo 获取type
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd =pageSize
	}
	let count
	let admin = req.session.admin
	let monstationId = req.session.stationId

	if(true){
		let _sql = `select MOU.*,PIN.provinceName,CI.cityName,STA.monstationName from ROMS202_MONUSER MOU join ROMS202_MONSTATION STA on STA.id=MOU.monstationId
		join ROMS202_DISTRICT DIS on DIS.id=STA.districtId join ROMS202_CITY CI on CI.id=DIS.cityId
		join ROMS202_PROVINCE PIN on PIN.id =CI.provinceId
		where type = ? order by createtime desc limit ?,?`
		console.log(_sql,'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK')
		let _params = [11,pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)
		//let _count_obj = await db.countTable('ROMS202_MONUSER')
		let __sql=`select count (*) as count from ROMS202_MONUSER where type=11 `
		let _count_obj = await db.raw_select(__sql,[])
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}
		res.json({usrs:back.result,count:count})
	}
}


//查询质控
async function get_usr_zk(req,res){
	//todo 获取type
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd =pageSize
	}
	let count
	let _sql = `select ?? from ?? where (type =4 or type=3 or type=2) AND nuclide is NULL order by createtime desc limit ?,?`
	let _params = [['id','displayUrl','photoUrl','monuserName','createtime','monuserPhone','type'],'ROMS202_MONUSER',pageStart,pageEnd]
	let back = await db.raw_select(_sql,_params)
	let _sql_count = `select count(*) as count from ROMS202_MONUSER where (type =4 or type=3 or type=2) AND nuclide is NULL`
	let _count_obj = await db.raw_select(_sql_count,[])
	if(_count_obj.success){
		count = _count_obj.result[0].count
	}else{
		count = 0
	}
	res.json({usrs:back.result,count:count})
}


//getprovincestaff
async function getprovincestaff(req,res){
	//todo 获取type
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd =pageSize
	}
	let count
	let provinceId = req.session.provinceId
	let monuserPhone = req.session.monuserPhone
	let str = `1=1`
	if(monuserPhone!=='admin'){
		str +=` AND a.provinceId = '${provinceId}'`
	}
	let _sql = `select a.*,b.provinceName from ROMS202_MONUSER a join ROMS202_PROVINCE b on b.id=a.provinceId where ${str} order by createtime desc limit ?,?`
	console.log(_sql)
	let _params = [pageStart,pageEnd]
	let back = await db.raw_select(_sql,_params)
	let _sql_count = `select count(*) as count from ROMS202_MONUSER a join ROMS202_PROVINCE b on b.id=a.provinceId where ${str}`
	console.log(_sql)
	console.log(_sql_count)
	let _count_obj = await db.raw_select(_sql_count,[])
	if(_count_obj.success){
		count = _count_obj.result[0].count
	}else{
		count = 0
	}
	res.json({usrs:back.result,count:count})
}

async function add_usr(req,res){
	let params = req.body
	let hasPhone = await has_this_phone(params.monuserPhone)
	if(hasPhone){
		res.json({success:false,msg:'此号码已重复添加'})
		return
	}

	let createtime = timing.now()
	let id = uuid()
	let monuserName = params.monuserName
	let monstationId = params.monstation
	let monuserPhone = params.monuserPhone
	let permitUrl = params.permitUrl 
	let photoUrl = params.baseUrl
	let displayUrl = params.displayUrl
	let password = params.pwd
	let type = params.type
	let pwd = cp.hash('md5','hex',password)
	console.log('添加人员 密码 ',pwd)
	//let displayUrl = params.displayUrl
	//let baseUrl = params.baseUrl

	//质控hack
	let _val
	let _key
	_key = ['id','createtime','monuserName','monstationId','monuserPhone','password','type','permitUrl','photoUrl','displayUrl']
	_val = [id,createtime,monuserName,monstationId,monuserPhone,pwd,type,permitUrl,photoUrl,displayUrl]
	let _params = ['ROMS202_MONUSER',_key,_val]
	let back = await db.raw_insert(_params)
	console.log(back)
	back.affected?res.json({id:id,success:true,msg:'添加成功'}):res.json({success:false,msg:'添加失败'})
}



async function addprovincestaff(req,res){
	console.log(req.body)
	let params = req.body
	let hasPhone = await has_this_phone(params.monuserPhone)
	if(hasPhone){
		res.json({success:false,msg:'此号码已重复添加'})
		return
	}

	let createtime = timing.now()
	let id = uuid()
	let monuserName = params.monuserName
	let province = params.province
	let monuserPhone = params.monuserPhone
	let password = params.pwd
	let displayUrl = params.displayUrl
	let baseUrl = params.baseUrl
	let type = params.type
	let pwd = cp.hash('md5','hex',password)
	console.log('添加人员 密码 ',pwd)

	let _val
	let _key
	_key = ['id','photoUrl','baseUrl','createtime','monuserName','provinceId','monuserPhone','password','type']
	_val = [id,baseUrl,displayUrl,createtime,monuserName,province,monuserPhone,pwd,type]
	let _params = ['ROMS202_MONUSER',_key,_val]
	let back = await db.raw_insert(_params)
	console.log(back)
	back.affected?res.json({id:id,success:true,msg:'添加成功'}):res.json({success:false,msg:'添加失败'})
}


async function delete_usr(req,res){
	let id = req.body.delete_id
	let _params = ['ROMS202_MONUSER',{id:id}]
	let back = await db.delete(_params)
	console.log(back)
	back.affected?res.json({success:true,msg:'删除成功'}):res.json({success:false,msg:'删除失败'})

}


async function update_usr(req,res){
	let params = req.body
	let id = params.update_id
	let _val = ['id','type','monuserName','monstationId','monuserPhone','password','photoUrl','displayUrl']
	let _change
	if(params.pwd){
		//质控专用
		_change = {
			type:params.type,
			monuserName:params.monuserName,
			monuserPhone:params.monuserPhone,
			permitUrl:params.permitUrl,
			password:cp.hash('md5','hex',params.pwd),
			photoUrl:params.photoUrl,
			displayUrl:params.displayUrl
		}
	}else{
		_change = {
			type:params.type,
			monuserName:params.monuserName,
			monuserPhone:params.monuserPhone,
			permitUrl:params.permitUrl,
			photoUrl:params.baseUrl,
			displayUrl:params.displayUrl
		}
	}
	let _params = ['ROMS202_MONUSER',_change,{id:id}]
	let back = await db.update(_params)
	console.log(back)
	back.affected?res.json({success:true,msg:'更新成功'}):res.json({success:false,msg:'更新失败'})
}

async function has_this_phone(phonenum){
	let _sql = 'select id from ROMS202_MONUSER where monuserPhone = ? '
	let _params = [phonenum]
	let back = await db.raw_select(_sql,_params)
	return back.success
}

async function get_all_usr_id(stationId){
	let _sql = `select id  from ROMS202_MONUSER where monstationId = ?`
	let back = await db.raw_select(_sql,[stationId])
	if(back.success){
		return back.result
	}else{
		return null
	}
}

const usr = {
	add_usr:add_usr,
	get_usr:get_usr,
	update_usr:update_usr,
	delete_usr:delete_usr,
	has_this_phone:has_this_phone,
	get_all_usr_id:get_all_usr_id,
	get_usr_zk:get_usr_zk,
	addprovincestaff,
	getprovincestaff
}

module.exports = usr
