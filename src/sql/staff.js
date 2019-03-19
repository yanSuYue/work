const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const Cp = require('my-easy-crypto')
const cp = new Cp()
const usr = require('./usr.js')

//用于省一级的获取所有监测人员或管理信息
async function get_staff(req,res){
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let flag = req.body.flag
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
	//人员信息增加省市及单位
	let _sql_admin = `select u.id,u.monuserName,u.createtime,u.monstationId,u.monuserPhone,u.displayUrl,u.permitUrl,u.photoUrl,
							s.monstationName,p.provinceName,d.districtName,c.cityName from ROMS202_MONUSER u
							inner join ROMS202_MONSTATION s
							on u.monstationId=s.id
							inner join ROMS202_DISTRICT d
							on s.districtId=d.id
							inner join ROMS202_CITY c
							on d.cityId=c.id
							inner join ROMS202_PROVINCE p
							on c.provinceId = p.id
							where u.type = 0
							order by u.createtime desc limit ?,?
						`
	let _sql_normal =
	`select u.id,u.monuserName,u.createtime,u.monstationId,u.monuserPhone,u.displayUrl,u.permitUrl,u.photoUrl,
							s.monstationName,p.provinceName,d.districtName,c.cityName from ROMS202_MONUSER u
							inner join ROMS202_MONSTATION s
							on u.monstationId=s.id
							inner join ROMS202_DISTRICT d
							on s.districtId=d.id
							inner join ROMS202_CITY c
							on d.cityId=c.id
							inner join ROMS202_PROVINCE p
							on c.provinceId = p.id
							where u.type = 0 and u.monstationId = ?
							order by u.createtime desc limit ?,?
						`
	if(true){
		if(flag==1){
			_sql_admin = `select u.id,u.type,u.nuclide,u.monuserName,u.createtime,u.monstationId,u.monuserPhone,u.displayUrl,u.permitUrl,u.photoUrl,
				s.monstationName,p.provinceName,d.districtName,c.cityName from ROMS202_MONUSER u
				inner join ROMS202_MONSTATION s
				on u.monstationId=s.id
				inner join ROMS202_DISTRICT d
				on s.districtId=d.id
				inner join ROMS202_CITY c
				on d.cityId=c.id
				inner join ROMS202_PROVINCE p
				on c.provinceId = p.id
				where (u.nuclide is Not null or u.nuclide != '' )
				order by u.createtime desc limit ?,?
			`
		}
		let back = await db.raw_select(_sql_admin,[pageStart,pageEnd])
		let __sql=`select count (*) as count from ROMS202_MONUSER where type=0 `
		if(flag==1){
			__sql=`select count (*) as count from ROMS202_MONUSER where (nuclide is Not null or nuclide != '' ) `
		}
		let _count_obj = await db.raw_select(__sql,[])

		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}
		res.json({staffs:back.result,count:count})
	}

}
//get_staff_info()
async function add_staff(req,res){
	let params = req.body
	let hasPhone = await usr.has_this_phone(params.monuserPhone)
	if(hasPhone){
		res.json({success:false,msg:'此号码已重复添加'})
		return
	}
	/*增加密码功能 0917*/

	let createtime = timing.now()
	let id = uuid()
	let monuserName = params.monuserName
	let monstationId = params.monstation
	let monuserPhone = params.monuserPhone
	let displayUrl = params.displayUrl
	let power = params.power2
	let type = params.role
	let baseUrl = params.baseUrl
	let permitUrl = params.permitUrl
	let password = cp.hash('md5','hex',params.password)
	let _key
	let _val
	_key = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','password','isAdmin','permitUrl']
	_val = [id,createtime,monuserName,monstationId,monuserPhone,displayUrl,baseUrl,password,1,permitUrl]
	if(power){
		_key = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','password','isAdmin','permitUrl','nuclide','type']
		_val = [id,createtime,monuserName,monstationId,monuserPhone,displayUrl,baseUrl,password,1,permitUrl,power,type]
	}
	let _params = ['ROMS202_MONUSER',_key,_val]
	let back = await db.raw_insert(_params)
	back.affected?res.json({id:id,success:true,msg:'添加成功'}):res.json({success:false,msg:'添加失败'})
}


async function delete_staff(req,res){
	let id = req.body.delete_id
	let _params = ['ROMS202_MONUSER',{id:id}]
	let back = await db.delete(_params)
	console.log(back)
	back.affected?res.json({success:true,msg:'删除成功'}):res.json({success:false,msg:'删除失败'})

}


async function update_staff(req,res){
	let params = req.body
	let id = params.update_id
	/*修改时要判断是否有password*/
	let _val
	let _change
	if(params.password){
		
		 _val = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','password','permitUrl']
		_change = {
			monuserName:params.monuserName,
			monuserPhone:params.monuserPhone,
			displayUrl:params.displayUrl,
			photoUrl:params.baseUrl,
			permitUrl:params.permitUrl,
			password:cp.hash('md5','hex',params.password)
		}
		if(params.flag==1){
			_val = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','password','type','nuclide','permitUrl']
			_change = {
				monuserName:params.monuserName,
				monuserPhone:params.monuserPhone,
				displayUrl:params.displayUrl,
				photoUrl:params.baseUrl,
				password:cp.hash('md5','hex',params.password),
				type:params.type,
				permitUrl:params.permitUrl,
				nuclide:params.power.join(',')
			}
		}
	}else{
		 _val = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','permitUrl']

		_change = {
			monuserName:params.monuserName,
			monuserPhone:params.monuserPhone,
			displayUrl:params.displayUrl,
			photoUrl:params.baseUrl,
			permitUrl:params.permitUrl
		}
		if(params.flag==1){
			_val = ['id','createtime','monuserName','monstationId','monuserPhone','displayUrl','photoUrl','type','nuclide','permitUrl']
			_change = {
				monuserName:params.monuserName,
				monuserPhone:params.monuserPhone,
				displayUrl:params.displayUrl,
				photoUrl:params.baseUrl,
				permitUrl:params.permitUrl,
				type:params.type,
				nuclide:params.power.join(',')
			}
		}
	}

	let _params = ['ROMS202_MONUSER',_change,{id:id}]
	let back = await db.update(_params)
	back.affected?res.json({success:true,msg:'更新成功'}):res.json({success:false,msg:'更新失败'})
}

const staff = {
	add_staff:add_staff,
	get_staff:get_staff,
	update_staff:update_staff,
	delete_staff:delete_staff
}

module.exports = staff
