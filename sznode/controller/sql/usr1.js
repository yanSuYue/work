const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const crypto = require('crypto')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime

const log = require('../../server/log.js')


const task = require('../sql/task.js')
const filterNum = require('./filter.js')


const usr = {}
usr.queryAllUsers = queryAllUsers
usr.addStaffType = addStaffType
usr.querySingleUser = querySingleUser
usr.addUser = addUser
usr.getpowerOptions = getpowerOptions
usr.getRoleOptions = getRoleOptions
usr.getdeviceTypeOptions = getdeviceTypeOptions
usr.deleteUser = deleteUser
usr.updateUser = updateUser
usr.filterStaff = filterStaff
usr.getcommonOptions = getcommonOptions
usr.getaroundOptions = getaroundOptions
usr.getindustry = getindustry
usr.getmedicalOptiions = getmedicalOptiions
usr.getmedicalOptiions2 = getmedicalOptiions2

const device = require('./device.js')



//查询某个用户的全部权限
function queryUserTypeById(id){
	return new Promise((resolve,reject)=>{
		let sql=`select ROLE.roleName as role, AUTH.*,TYPE.name,MAIN.name asmainname from ROMS_SZ_STAFFAUTH AUTH join ROMS_SZ_ROLE ROLE on ROLE.id=AUTH.roleId join ROMS_SZ_DEVICETYPE TYPE on TYPE.id=AUTH.deviceTypeId join ROMS_SZ_DEVICEMAIN MAIN on MAIN.id = TYPE.deviceMainId where AUTH.staffId='${id}'  `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			let types = rows.map((item)=>{
				return item.num
			})
			let mainNames = rows.map((item)=>{
				let obj={
					name:item.name,
					role:item.role,
					mainName:item.asmainname,
					authId:item.id,
					photoUrl:item.photoUrl
				}
				return obj
			})
			resolve({types,mainNames})
		})
	})
}

//查询某个用户的全部权限
function queryUserPowerById(id){
	return new Promise((resolve,reject)=>{
		let searchPro=new Promise((resolve,reject)=>{
			let sql=`select roleId from ROMS_SZ_STAFF where id="${id}"`
			pool.query(sql,(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows[0].roleId)
			})
		})
		searchPro.then(id=>{
			pool.query(`select modList from ROMS_SZ_ROLE where id ="${id}"`,(err,rows,field)=>{
				if(err)reject(err)
				resolve({powers:rows[0].modList})
			})	
		})
	})
}

//查询某个用户的全部权限
function queryUserDistrict(id){
	return new Promise((resolve,reject)=>{
		let searchPro=new Promise((resolve,reject)=>{
			let sql=`select subCompanyId from ROMS_SZ_STAFF where id="${id}"`
			pool.query(sql,(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows[0].subCompanyId)
			})
		})
		searchPro.then(id=>{
			pool.query(`select subCompanyName from ROMS_SZ_SUBCOMPANY where id ="${id}"`,(err,rows,field)=>{
				if(err)reject(err)
				resolve({district:rows[0].subCompanyName})
			})
		})
	})
}

//查询某个用户的详细信息
function queryUserInfoById(id){
	return new Promise((resolve,reject)=>{
		pool.query('select * from ROMS_SZ_STAFF where id = ? and unusable = 0',[id],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0])
		})
	})
}

//查询所有用户信息
function queryAllUsersInfo(pageSize,pageNow,staffName,staffPhone,subCompanyName,id){
	let start = pageSize*pageNow
	let end = 10
	return new Promise((resolve,reject)=>{
		let sql = `select STAFF.permitUrl,STAFF.id,STAFF.createtime,STAFF.staffName,
		STAFF.staffPhone,STAFF.photoUrl as uploadUrl,STAFF.baseurl as displayUrl, COM.subCompanyName from ROMS_SZ_STAFF STAFF
		join ROMS_SZ_SUBCOMPANY COM on COM.id=STAFF.subCompanyId 
		where STAFF.staffName like '%${staffName}%' AND STAFF.staffPhone like '%${staffPhone}%' AND
		COM.id LIKE '%${id}%' AND COM.subCompanyName like '%${subCompanyName}%' limit ${start},${end} `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err);
			resolve(rows)
		})
	})	
}

//查询所有用户信息
function countUser(staffName,staffPhone,subCompanyName,id){
	return new Promise((resolve,reject)=>{
		let sql = `select COUNT(*) as count from ROMS_SZ_STAFF STAFF join ROMS_SZ_SUBCOMPANY COM on COM.id=STAFF.subCompanyId 
		where STAFF.staffName like '%${staffName}%' AND STAFF.staffPhone like '%${staffPhone}%' AND 
		COM.id LIKE '%${id}%' AND COM.subCompanyName like '%${subCompanyName}%' `
		pool.query(sql,(err,rows,field)=>{
			resolve(rows)
		})
	})	
}

function getRoleOptions(req,res){
	if(req.body.subCompanyId=='undefined'){
		req.body.subCompanyId=''
	}
	let sql = `select * from ROMS_SZ_SUBCOMPANY where id LIKE '%${req.body.subCompanyId}%'`
	//let sql = `CALL ROMS202_SHENHE()`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}

function getpowerOptions(req,res){
	let sql = `select * from ROMS_SZ_ROLE where roleName is not null`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}

function getdeviceTypeOptions(req,res){
	let sql = `select * from ROMS_SZ_DEVICEMAIN order by createtime`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}
//医用防护
function getmedicalOptiions(req,res){
	let sql = `select * from ROMS_SZ_DEVICETYPE where deviceMainId=1`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}
//医用性能
function getmedicalOptiions2(req,res){
	let sql = `select * from ROMS_SZ_DEVICETYPE where deviceMainId=5`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}
//公共卫生
function getcommonOptions(req,res){
	let sql = `select * from ROMS_SZ_DEVICETYPE where deviceMainId=4`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}
//环境卫生
function getaroundOptions(req,res){
	let sql = `select * from ROMS_SZ_DEVICETYPE where deviceMainId=3`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}
//工业放射
function getindustry(req,res){
	let sql = `select * from ROMS_SZ_DEVICETYPE where deviceMainId=2`
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
}

async function queryAllUsers(req,res){
	let pageSize=req.body.pageSize
	let pageNow = req.body.pageNow
	let user = req.body.user
	let userTel = req.body.userTel
	let userdistrict = req.body.userdistrict
	let subCompanyId = req.body.subCompanyId
	if(subCompanyId=='undefined'){
		subCompanyId=''
	}
	try{
		console.log('----------------查询所有工作人员信息-------------')
		let infos;
		let [allUsersInfo,count]= await Promise.all([queryAllUsersInfo(pageSize,pageNow,user,userTel,userdistrict,subCompanyId),countUser(user,userTel,userdistrict,subCompanyId)])
		infos = allUsersInfo.map(async(item)=>{
			let [types,powers,district] = await Promise.all([queryUserTypeById(item.id),queryUserPowerById(item.id),queryUserDistrict(item.id)]);			
			item.type = types.types
			item.mainNames =types.mainNames
			item.power = powers.powers
			item.district=district.district
		})
		Promise.all(infos)
		.then(()=>{
			res.json({staffs:allUsersInfo,count:count[0].count})
		})
		.catch(err=>console.log(err))
	}catch(err){
		res.json({err:err,msg:'error'})
	}
	//return Promise.all(infos)
}

//查询某个用户信息
function querySingleUser(id,res){
	console.log('----------------查询单个工作人员信息-------------')
	let info = queryUserInfoById(id)
	let types = queryUserTypeById(id)
	Promise.all([info,types])
	.then(([info,types])=>{
		info['types']=types.types
		return info
		
	})
	.then(info=>{
		res.json(info)
	})
	.catch(err=>{

	})
}



//查询深圳人员
function queryszPeople(req,res){
	let sql = `SELECT id FROM ROMS_SZ_SUBCOMPANY WHERE subCompanyName='深圳'`
	log.info(sql)
	pool.query(sql,(err,rows,field)=>{
		res.json({result:rows})
	})
} 


//根据多个设备类型id(arr)从taskauth筛选出所有合适的staffId
function filterStaffId(subCompanyId,deviceIdArr){
	let str=``
	let str2=``
	if(subCompanyId!='undefined'&&subCompanyId){
		str=`join ROMS_SZ_STAFF STAFF on STAFF.id=AUTH.staffId`
		str2=` STAFF.subCompanyId='${subCompanyId}' AND`
	}
	//type-------
	let sql = `select distinct AUTH.staffId from ROMS_SZ_STAFFAUTH AUTH ${str} where ${str2} AUTH.deviceTypeId = ? `
	let staffArr = deviceIdArr.map((item)=>{
			return new Promise((resolve,reject)=>{
			pool.query(sql,[item],(err,rows,field)=>{
				if(err)reject(err)
				let arr = []
				arr = rows.map((item)=>{
					return item.staffId
				})
				resolve(arr)
			})
		})
	})
	return Promise.all(staffArr)
}
//根据任务类型筛选用户
async function filterStaffInfo(staffArr,res,str){
	let types;
	log.info(staffArr)
	if(staffArr.length>1){
		types = filterNum.commonTypes(staffArr)
	}else{
		types = staffArr[0]
	}


	let sql2 = 'select count(*) as count from ROMS_SZ_DOC where docPassAuditor=0 AND staffAuditorId = ?'
	let staffcountsAuditor = types.map(async (item)=>{
		return new Promise((resolve,reject)=>{
			pool.query(sql2,[item],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})
	})
	let sql3 = 'select count(*) as count from ROMS_SZ_DOC where docPassIssue=0 AND staffIssueId = ?'
	let staffcountsIssue = types.map(async (item)=>{
		return  new Promise((resolve,reject)=>{
			pool.query(sql3,[item],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})
	})
	let sql = 'select staffName,staffPhone,id from ROMS_SZ_STAFF where id = ?'
	let staffs = types.map((item)=>{
		return  new Promise((resolve,reject)=>{
			pool.query(sql,[item],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})
	})
	Promise.all(staffs)
	.then((rows)=>{
		Promise.all(staffcountsIssue).then(arr2=>{
			let arr = []
			Promise.all(staffcountsAuditor).then(arr3=>{
				// arr = rows.map((item)=>{
				// 	arr[0].count1=staffcountsAuditor[0]
				// 	arr[0].count2=staffcountsIssue[0]
				// 	return item[0]
				// })
				for(let i=0;i<rows.length;i++){
					arr[i]=rows[i][0]
					arr[i].count1=arr2[i][0].count
					arr[i].count2=arr3[i][0].count
				}
				res.json({staffs:arr,str:str})
			})
		})
	})
	.catch(err=>{
		res.json({staffs:[]})
	})
}

async function filterStaff(subCompanyId,deviceIdArr,res,taskid){
	let staffArr = await filterStaffId(subCompanyId,deviceIdArr)
	//let szstaffArr = await filterStaffId("f3167693-b3ab-11e7-b2ca-00163e010059",deviceIdArr)
	let str = await getstaff(taskid)
	filterStaffInfo(staffArr,res,str)
}

//getstaff
function getstaff(id){
	let sql = `SELECT b.staffName FROM ROMS_SZ_DOC a JOIN ROMS_SZ_STAFF b ON a.staffAuditorId =b.id WHERE a.taskId='${id}'`
	return new Promise((resolve,reject)=>{
		pool.query(sql,[],(err,rows,field)=>{
			if(err)reject(err)
			if(rows.length>0){
				resolve({str:rows[0].staffName})
			}else{
				resolve({str:''})
			}
		})
	})
}


//查询用户是否重复
function uniqueUser(user){
	let sql = 'select * from ROMS_SZ_STAFF where staffName = ? or staffPhone = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[user.staffName,user.staffPhone],(err,rows,field)=>{
			if(err)reject(err)
			if(rows.length>0){
				resolve({msg:'用户名或电话号码重复',code:1})
			}else{
				resolve({msg:'未重复',code:0})
			}
		})
	})
}

function md5(id){
	const md5 = crypto.createHash("md5")
	const hash = md5.update(id).digest('base64');
	return hash;
}

//添加用户信息
function addUserInfo(user){
	let id = uuid()
	let md5pwd=md5(md5(user.pwd).substring(2,8))+md5('xtroms')
	let createtime = makeDateTime().time
	let mysql = 'insert into ROMS_SZ_STAFF (id,staffName,staffPhone,photoUrl,createtime,baseurl,password,permitUrl) values (?,?,?,?,?,?,?,?)'

	return new Promise((resolve,reject)=>{
		pool.query(mysql,[id,user.staffName,user.staffPhone,user.uploadUrl,createtime,user.displayUrl,md5pwd,user.permitUrl],(err,rows,field)=>{
			if(err)reject(err)
			console.log('添加用户信息成功')
			resolve({rows:rows,id:id})
		})
	})
}

//添加用户权限
// function addUserType(staffId,arr){	
// 	let sql = "insert into ROMS_SZ_STAFFAUTH (id,staffId,deviceTypeId,num,createtime) values (?,?,?,?,?)"
// 	let promises = arr.map(async(item)=>{
// 		let id = uuid()
// 		let time = makeDateTime().time
// 		let deviceTypeId = await device.selectByNum(item)
// 		return new Promise((resolve,reject)=>{
// 			pool.query(sql,[id,staffId,deviceTypeId,item,time],(err,rows,field)=>{
// 				if(err)reject(err)
// 				console.log('添加用户权限成功')
// 				resolve(rows)
// 			})
// 		})
// 	})
// 	return Promise.all(promises)
// }

//添加用户权限
async function addStaffType(req,res){
	let id = uuid()
	let createtime = makeDateTime().time
	let deviceTypeId =req.body.type
	let staffId =req.body.staffId
	let photoUrl =req.body.url
	let roleId =req.body.role
	
	let cc =  await checkStaffType(staffId,deviceTypeId,roleId);
	log.info("cc="+cc);
	if(cc==-1)
	{
		res.json({success:false,msg:'添加错误!'})
		return ;
	}
	if(cc>0)
	{
		res.json({success:false,msg:'该权限已存在!'})
		return;
	}
	
	let sql=`insert into  ROMS_SZ_STAFFAUTH (id,createtime,deviceTypeId,staffId,roleId) values ('${id}','${createtime}','${deviceTypeId}','${staffId}','${roleId}')`
	console.log(sql)
	pool.query(sql,(err,rows,field)=>{
		if(err){
			res.json(err)
		}else{
			res.json({success:true,message:'添加成功!'})
		}
	})
}


//查找用户该权限是否重复
function checkStaffType(staffId,deviceTypeId,roleId){
	let sql = `select count(*) as total  from  ROMS_SZ_STAFFAUTH where staffId='${staffId}' and deviceTypeId='${deviceTypeId}' and roleId='${roleId}' `
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err){
				log.info(sql);
				log.info(err);
				resolve(-1)
			}
			if(rows){
				resolve(rows[0].total)
			}else{
				resolve(-1)
			}
			
		})
	})
}





function addpower(staffId,arr){
	return new Promise((resolve,reject)=>{
		let arrstr=arr.join(',')
		let checkPro=new Promise((resolve,reject)=>{
			let sql=`select id from ROMS_SZ_ROLE where modList="${arrstr}"`
			pool.query(sql,(err,rows,field)=>{
				if(err)reject(err)
				console.log(rows,'........................>>>>>>>>>>>>>>>>')
				resolve(rows)
			})
		})
		checkPro.then(res=>{
			
			if(res.length){
				console.log('999999999999999999999999999999999999999999999999999999',res)
				let sql=`update ROMS_SZ_STAFF set roleId="${res[0].id}" where id="${staffId}"`
				console.log(res.length,sql)
				pool.query(sql,(err,rows,field)=>{
					if(err)reject(err)
					resolve(rows)
				})
			}else{
				let pro=new Promise((resolve,reject)=>{
					let id = uuid()
					let time = makeDateTime().time
					let sql=`insert into ROMS_SZ_ROLE (id,createtime,modList) values ("${id}","${time}","${arrstr}")`
					console.log(sql)
					pool.query(sql,(err,rows,field)=>{
						if(err)reject(err)
						resolve(id)
					})
				});
				pro.then(id=>{
					let sql=`update ROMS_SZ_STAFF set roleId="${id}" where id="${staffId}"`
					pool.query(sql,(err,rows,field)=>{
						if(err)reject(err)
						console.log('添加用户权限成功')
						resolve(rows)
					})
				})
			}
		})
	})
}

//添加用户地区
function adddistrict(staffId,district){
	return new Promise((resolve,reject)=>{
		let searchPro=new Promise((resolve,reject)=>{
			let sql=`select id from ROMS_SZ_SUBCOMPANY where subCompanyName="${district}"`
			pool.query(sql,(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})
		searchPro.then(res=>{
			let sql=`update ROMS_SZ_STAFF set subCompanyId="${res[0].id}" where id="${staffId}"`
			console.log(sql,'=================================>>>>>>>>>>>>')
			pool.query(sql,(err,rows,field)=>{
				if(err)reject(err)
				console.log('添加用户subCompanyId成功')
				resolve(rows)
			})
		})
	})
}

//添加用户
async function addUser(obj,res){
	if(!obj){
		console.log('obj 为空')
		return;
	}
	let unique = await uniqueUser(obj)
	if(unique.code==1){
		res.json({msg:'用户信息重复',success:false})
		console.log('用户信息重复')
		return;
	}
	let userInfo = await addUserInfo(obj)

	let allDone = await Promise.all([addpower(userInfo.id,obj.power),adddistrict(userInfo.id,obj.district)]);//,adddistrict(userInfo.id,obj.district)
	Promise.resolve(allDone)
	.then((result)=>{
		console.log('人员信息全部添加成功')
		res.json({msg:'添加成功',success:true,id:userInfo.id})
	})
	.catch(err=>{
		console.log('人员信息添加失败')
		console.log(err)
		res.json({msg:'添加失败',type:'SERVER ERR',success:false})
	})
}


//删除用户信息
function deleteUserInfo(id){
	return new Promise((resolve,reject)=>{
		console.log('GGGGGGGGGGGGGGGGGGGG')
		pool.query('delete from ROMS_SZ_STAFF where id = ?',[id],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//删除用户权限
function deleteUserType(id){
	return new Promise((resolve,reject)=>{
		pool.query('delete from ROMS_SZ_STAFFAUTH where staffId = ?',[id],(err,rows,field)=>{
			if(err)reject(err)
			console.log('删除所有用户权限成功')
			resolve(rows)
		})	
	})	
}

//删除用户下角色权限
function deleteUserRole(staffId,roleId){
	return new Promise((resolve,reject)=>{
		pool.query('delete from ROMS_SZ_STAFFAUTH where staffId = ? and roleId = ?',[staffId,roleId],(err,rows,field)=>{
			if(err)reject(err)
			console.log('删除用户角色权限成功')
			resolve(rows)
		})	
	})	
}



//删除与任务关联的staffId
function deleteTaskStaff(staffId){ 
	let sql = 'delete from ROMS_SZ_TASKSTAFF where staffId = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[staffId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//删除用户
//先删除 task_staff staff_auth 外键
async function deleteUser(id,res){
	await Promise.all([deleteTaskStaff(id),deleteUserType(id)])
	let deleteStaffInfo = await deleteUserInfo(id)
	Promise.resolve(deleteStaffInfo)
	.then((deleteStaffInfo)=>{
		res.json({msg:'删除成功',success:true})
	})
	.catch(err=>{
		console.log(err)
		res.json({msg:'删除失败',success:false})
	})
}

//先更新用户信息
function updateUserInfo(obj){
	return new Promise((resolve,reject)=>{
		let sql,arr;
		if(obj.newpwd.length){
			sql = 'update ROMS_SZ_STAFF set permitUrl = ?,password = ?, staffName = ? ,staffPhone = ?, photoUrl = ?,baseurl = ? where id = ?'
			arr = [obj.permitUrl,md5(md5(obj.newpwd).substring(2,8))+md5('xtroms'),obj.staffName,obj.staffPhone,obj.uploadUrl,obj.displayUrl,obj.id]
		}else{
			sql = 'update ROMS_SZ_STAFF set permitUrl=?, staffName = ? ,staffPhone = ?, photoUrl = ?,baseurl = ? where id = ?'
			arr = [obj.permitUrl,obj.staffName,obj.staffPhone,obj.uploadUrl,obj.displayUrl,obj.id]
		}
		pool.query(sql,arr,(err,rows,field)=>{
			if(err)reject(err)
			console.log('用户基本信息更新成功')
			resolve(rows)
		})
	})	
}

//账户验证
function checkpwd(obj,res){
	return new Promise((resolve,reject)=>{
		let md5pwd=md5(md5(obj.oldpwd).substring(2,8))+md5('xtroms')
		let sql = `select * from ROMS_SZ_STAFF  where id="${obj.id}" and password="${md5pwd}"`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows.length)
		})
	})	
}

//查询角色对应id
function queryRole(roleName,res){
	return new Promise((resolve,reject)=>{
		let sql = `select * from ROMS_SZ_ROLE  where roleName="${roleName}" `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})	
}

//然后再删除所有权限 添加新权限 然后更新用户
async function updateUser(obj,res){
	if(obj.newpwd.length){
		let ischech = await checkpwd(obj,res)
		if(!ischech){
			res.json({msg:'原密码验证失败',success:false})
			return false
		}
	}
	console.log('obj.power'+obj.power);
	var powerObj = obj.power.toString();
	
	console.log('powerObj.indexOf("检测员")'+powerObj.indexOf("检测员"));
	if(powerObj.indexOf("检测员") == -1){
		let role = await queryRole('检测员',res)
		if(role[0].id != null){
			await Promise.all([deleteUserRole(obj.id,role[0].id)]);
		}
	} 
	if(powerObj.indexOf("报告审核员") == -1){
		let role = await queryRole('报告审核员',res)
		if(role[0].id != null){
			await Promise.all([deleteUserRole(obj.id,role[0].id)]);
		}
	} 
	if(powerObj.indexOf("报告签发员") == -1){
		let role = await queryRole('报告签发员',res)
		if(role[0].id != null){
			await Promise.all([deleteUserRole(obj.id,role[0].id)]);
		}
	}
	
	
	await Promise.all([updateUserInfo(obj)]);

	//先删除所有用户信息
	let allDone=await Promise.all([addpower(obj.id,obj.power),adddistrict(obj.id,obj.district)]);
	Promise.all(allDone)
	.then((rows)=>{
		console.log(rows)
		res.json({msg:'更新成功',success:true})
	})
	.catch(err=>{
		console.log(err)
		res.json({msg:'更新失败',success:false})
	})
}



module.exports=usr



