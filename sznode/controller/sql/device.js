const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime
const parseTime = require('../public/timeParse.js').parseTime
const log = require('../../server/log.js')

const device = {}
module.exports = device 

device.selectByNum = selectByNum
device.getimages = getimages
device.getallimages = getallimages
device.updataimgid = updataimgid
device.updatemanage = updatemanage
device.delmanage = delmanage
device.addmanage = addmanage 
device.delDevicePower = delDevicePower
device.addDeviceAuth = addDeviceAuth
device.deldevices = deldevices
device.addDevices = addDevices
device.getdevices = getdevices
device.addDeviceType = addDeviceType
device.addNewDevice = addNewDevice
device.updateDevice = updateDevice
device.queryAllDeviceType = queryAllDeviceType
device.queryNameById = queryNameById
device.queryDeviceTypeInfoByTask = queryDeviceTypeInfoByTask
//只要初始用一次就可以了
function addDeviceType(devices){
	console.log(devices)
	let sql = 'insert into ROMS_SZ_DEVICETYPE (id,createtime,name,type,num) values (?,?,?,?,?)'
	let promises = devices.map((item)=>{
		return new Promise((resolve,reject)=>{
			let id = uuid()
			let time = makeDateTime().time
			pool.query(sql,[id,time,item.name,item.type,item.num],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})
	})
	return Promise.all(promises)
}

async function addDeviceAuth(req,res){
	
	let id = uuid()
	let deviceId = req.body.deviceId
	let templateId = req.body.templateId
	let deviceTypeId = req.body.deviceTypeId
	let createtime = makeDateTime().time
	
	log.info('--------------------start');
	let cc =  await checkDeviceAuth(deviceId,deviceTypeId,templateId);
	log.info("cc="+cc);
	log.info('--------------------end');
	if(cc==-1)
	{
		res.json({success:false,msg:'添加错误!'})
		return ;
	}
	if(cc>0)
	{
		res.json({success:false,msg:'该设备已存在!'})
		return;
	}
	
	
	
	
	sql = `insert into ROMS_SZ_DEVICEAUTH (id,createtime,deviceId,deviceTypeId,templateId) values ('${id}','${createtime}','${deviceId}','${deviceTypeId}','${templateId}')`
	pro = new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err){
				reject(err)
			}else{
				resolve(rows)
			}
		})
	})
	pro.then(e=>{
		res.json({success:true,msg:'添加成功!'})
	}).catch(err=>{
		res.json(err)
	})
}

function delDeviceAuth(id){
	return new Promise((resolve,reject)=>{
		let sql=`delete from ROMS_SZ_DEVICEAUTH where deviceId='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err){
				reject(err)
			}else{
				resolve(err)
			}
		})
	})
}

function delDevice(id,res){
	return new Promise((resolve,reject)=>{
		let sql=`delete from ROMS_SZ_DEVICE where id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err){
				res.json({success:true,message:'服务器错误'})
			}else{
				res.json({success:true,message:'删除成功！'})
			}
		})
	})
}

async function deldevices(req,res){
	let id=req.body.id
	await delDeviceAuth(id)
	await delDevice(id,res)
}

async function addDevices(req,res){
	let id = uuid()
	let createtime = makeDateTime().time
	let str=``
	let vals=``
	if(req.body.purpose==='其他'){
		str="deviceNum,deviceModel,deviceName,id,createtime,correctNum,correctTime,deviceUnit,state,purpose,subcompanyId"
		vals=`'${req.body.deviceNum}','${req.body.deviceModel}','${req.body.deviceName}',${id}','${createtime}','${req.body.correctNum}','${parseTime(req.body.correctTime)}','${req.body.deviceUnit}','${req.body.state}','${req.body.purpose}','${req.body.subCompanyId}'`
	}
	if(req.body.purpose==='防护'){
		str="deviceNum,deviceModel,deviceName,factor,deviceFactor,id,createtime,correctNum,correctTime,correctNum1,correctTime1,deviceUnit,state,purpose,subcompanyId,deviceLower,lowerTime"
		vals=`'${req.body.deviceNum}','${req.body.deviceModel}','${req.body.deviceName}','${req.body.domains}','${JSON.stringify(req.body.domains2)}','${id}','${createtime}','${req.body.correctNum}','${parseTime(req.body.correctTime)}','${req.body.correctNum1}','${parseTime(req.body.correctTime1)}','${req.body.deviceUnit}','${req.body.state}','${req.body.purpose}','${req.body.subCompanyId}','${req.body.deviceLower}','${parseTime(req.body.lowerTime)}'`
	}
	if(req.body.purpose==='性能'){
		str="deviceNum,deviceModel,deviceName,deviceFactor,deviceFactor_gdy,id,createtime,correctNum,correctTime,correctNum1,correctTime1,deviceUnit,state,purpose,subcompanyId"
		vals=`'${req.body.deviceNum}','${req.body.deviceModel}','${req.body.deviceName}','${JSON.stringify(req.body.domains)}','${JSON.stringify(req.body.domains2)}','${id}','${createtime}','${req.body.correctNum}','${parseTime(req.body.correctTime)}','${req.body.correctNum1}','${parseTime(req.body.correctTime1)}','${req.body.deviceUnit}','${req.body.state}','${req.body.purpose}','${req.body.subCompanyId}'`
	}
	
	let sql=`insert into ROMS_SZ_DEVICE (${str}) values (${vals})`
	console.log(sql)
	pool.query(sql,(err,rows,field)=>{
		if(err){
			res.json({success:false,message:'数据库错误'})
		}else{
			res.json({success:true,message:'仪器添加成功'})
		}
	})
}

//查找某类型仪器的id 
function selectByNum(num){
	console.log('num------',num)
	let sql = 'select id from ROMS_SZ_DEVICETYPE where num = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[num],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0].id)
		})
	})
}



//查找设备是否已存在
function checkDeviceAuth(deviceId,deviceTypeId,templateId){
	let sql = `select count(*) as total  from  ROMS_SZ_DEVICEAUTH where deviceId='${deviceId}' and deviceTypeId='${deviceTypeId}' and templateId='${templateId}' `
	
	
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err){
				log.info(sql);
				log.info(err);
				resolve(-1)
				
				//reject(err)
			}
			if(rows){
				resolve(rows[0].total)
			}else{
				resolve(-1)
			}
			
		})
	})
	
}


//查找设备是否已存在
function checkChartName(chartName){
	let sql = `select count(*) as total  from  ROMS_SZ_CHART where chartName='${chartName}'  `
	
	
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err){
				log.info(sql);
				log.info(err);
				resolve(-1)
				
				//reject(err)
			}
			if(rows){
				resolve(rows[0].total)
			}else{
				resolve(-1)
			}
			
		})
	})
	
}

function addNewDevice(obj){
	let id = uuid()
	let createtime = makeDateTime().time
	let sql = `insert into ROMS_SZ_DEVICE 
				(id,createtime,deviceName,deviceNum,correctNum,deviceUnit,correctTime) 
				values 
				(?,?,?,?,?,?,?)
			`
	return new Promise((resolve,reject)=>{
		pool.query(sql,
		[id,createtime,obj.deviceName,obj.deviceNum,obj.correctNum,obj.deviceUnit,obj.correctTime],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
//getimages
async function getimages(req,res){
	let data = req.body

	let start=(data.pageSize-1)*10
	let [devices,count]=await Promise.all([getimagesInfo(start,data.keyword),countgetimages(data.keyword)])
	Promise.all([devices,count]).then(e=>{
		res.json({e})
	}).catch(e=>{
		res.json(e)
	})
}
//getallimages
function getallimages(req,res){
	log.info("getallimages");
	let query = req.body.query;
	log.info("query:"+query);
	
	return new Promise((resolve,reject)=>{
		let sql = `select * from ROMS_SZ_CHART where chartName like '%${query}%' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			res.json({r:rows})
		})
	})
}
function getimagesInfo(start,keyword){
	return new Promise((resolve,reject)=>{
		let str=``
		if(keyword){
			str=`where chartName like '${keyword}'`
		}
		let sql = `select * from ROMS_SZ_CHART ${str}  limit ${start},10`
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
function countgetimages(keyword){
	return new Promise((resolve,reject)=>{
		let str=``
		if(keyword){
			str=`where chartName like '${keyword}'`
		}
		let sql = `select count(*) as count from ROMS_SZ_CHART ${str}`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
//addmanage

async function addmanage(req,res){
	
	
	let chartName = req.body.chartName;
	let cc =  await checkChartName(chartName);
	log.info("cc="+cc);
	
	if(cc==-1)
	{
		res.json({success:false,msg:'添加错误!'})
		return ;
	}
	if(cc>0)
	{
		res.json({success:false,msg:'该文件已存在!'})
		return;
	}
	
	
	
	return new Promise((resolve,reject)=>{
		let obj=req.body
		let id = uuid()
		let createtime = makeDateTime().time
		let sql = `insert into ROMS_SZ_CHART 
					(id,createtime,chartName,chartUrl) 
					values 
					(?,?,?,?)
			`
		pool.query(sql,
		[id,createtime,obj.chartName,obj.chartUrl],(err,rows,field)=>{
			if(err)res.json({success:false,msg:'插入数据库错误'})
			res.json({success:true,msg:'新增图片成功'})
		})
	})
}

function queryAllDevices(){
	let sql = 'select * from ROMS_SZ_DEVICE'
	pool.query(sql,(err,rows,field)=>{
		if(err)reject(err)
		resolve(rows)
	})
}

function queryDeviceById(id){
	let sql = 'select * from ROMS_SZ_DEVICE where id = ?'
	pool.query(sql,[id],(err,rows,field)=>{
		if(err)reject(err)
		resolve(rows)
	})
}

function getDevicePower(id){
	return new Promise((resolve,reject)=>{
		let sql=`select MAIN.name, TYPE.name as deviceTypeName,TEM.name as templateName, AUTH.* from ROMS_SZ_DEVICEAUTH AUTH join ROMS_SZ_DEVICETYPE TYPE
		on TYPE.id=AUTH.deviceTypeId join ROMS_SZ_TEMPLATE TEM on TEM.id=AUTH.templateId join ROMS_SZ_DEVICEMAIN MAIN on TYPE.deviceMainId=MAIN.id where deviceId='${id}'`
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function delDevicePower(id,res){
	let pro=new Promise((resolve,reject)=>{
		let sql=`delete from ROMS_SZ_DEVICEAUTH where id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
	pro.then(e=>{
		res.json({success:true,msg:'删除成功!'})
	}).catch(err=>{
		res.json(err)
	})
}
//delmanage
function delmanage(id,res){
	let pro=new Promise((resolve,reject)=>{
		let sql=`delete from ROMS_SZ_CHART where id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
	pro.then(e=>{
		res.json({success:true,msg:'删除成功!'})
	}).catch(err=>{
		res.json(err)
	})
}

async function getdevices(data,res){
	let len = data.pageSize
	let start=data.pageNow*len
	let obj=data.search
	let [devices,count]=await Promise.all([getdeviceInfo(start,len,obj),countDevices(obj)])
	let promises = devices.map(async (item)=>{
		console.log(item)
		let powers=await getDevicePower(item.id)
		item.powers=powers
		return item;
	})
	Promise.all(promises).then(e=>{
		res.json({devices:devices,count:count})
	}).catch(e=>{
		res.json(e)
	})
}

function getdeviceInfo(start,len,obj){
	return new Promise((resolve,reject)=>{
		let str=`where 1=1`
		if(obj.subCompanyId){
			str+=` AND DEVICE.subCompanyId='${obj.subCompanyId}'`
		}
		if(obj.name){
			str+=` AND DEVICE.deviceName='${obj.name}'`
		}
		if(obj.type){
			str+=` AND DEVICE.deviceModel='${obj.type}'`
		}
		if(obj.num){
			str+=` AND DEVICE.deviceNum='${obj.num}'`
		}
		let sql = `select DEVICE.*,COM.subCompanyName from ROMS_SZ_DEVICE DEVICE left join ROMS_SZ_SUBCOMPANY COM on COM.id=DEVICE.subCompanyId
		${str} order By createtime desc limit ${start},${len}`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//updateDevice
function updateDevice(req,res){
	let endSql=``
	if(req.body.purpose==='其他'){
		endSql=`deviceNum='${req.body.deviceNum}',deviceModel='${req.body.deviceModel}',deviceName='${req.body.deviceName}',correctNum='${req.body.correctNum}',correctTime='${parseTime(req.body.correctTime)}',deviceUnit='${req.body.deviceUnit}',state='${req.body.state}'`
	}
	if(req.body.purpose==='防护'){
		endSql=`deviceNum='${req.body.deviceNum}',deviceModel='${req.body.deviceModel}',deviceName='${req.body.deviceName}',factor='${req.body.domains}',deviceFactor='${JSON.stringify(req.body.domains2)}',correctNum='${req.body.correctNum}',correctTime='${parseTime(req.body.correctTime)}',correctNum1='${req.body.correctNum1}',correctTime1='${parseTime(req.body.correctTime1)}',deviceUnit='${req.body.deviceUnit}',state='${req.body.state}',deviceLower='${req.body.deviceLower}',lowerTime='${parseTime(req.body.lowerTime)}'`
	}
	if(req.body.purpose==='性能'){
		endSql=`deviceNum='${req.body.deviceNum}',deviceModel='${req.body.deviceModel}',deviceName='${req.body.deviceName}',deviceFactor='${JSON.stringify(req.body.domains)}',deviceFactor_gdy='${JSON.stringify(req.body.domains2)}',correctNum='${req.body.correctNum}',correctTime='${parseTime(req.body.correctTime)}',correctNum1='${req.body.correctNum1}',correctTime1='${parseTime(req.body.correctTime1)}',deviceUnit='${req.body.deviceUnit}',state='${req.body.state}'`
	}
	let sql=`update ROMS_SZ_DEVICE set ${endSql} where id = '${req.body.id}'`
	let promise=new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
	promise.then(e=>{
		res.json({success:true,msg:'更新成功！'})
	}).catch(e=>{
		res.json(e)
	})
}

function updatemanage(obj,res){
	return new Promise((resolve,reject)=>{
		let sql = `update ROMS_SZ_CHART set chartName='${obj.chartName}',chartUrl='${obj.chartUrl}' where id='${obj.id}'`
		
		pool.query(sql,[],(err,rows)=>{
			if(err)res.json({err})
			res.json({success:true,msg:'更新成功'})
		})
	})
}
//updataimgid

function updataimgid(obj,res){
	return new Promise((resolve,reject)=>{
		let sql = `update  ROMS_SZ_TASK  set chartId='${obj.chartId}' where id='${obj.id}'`
		console.log(sql)
		pool.query(sql,[],(err,rows)=>{
			if(err)res.json({err})
			res.json({success:true,msg:'更新成功'})
		})
	})
}

function countDevices(obj){
	return new Promise((resolve,reject)=>{
		let str=`where 1=1`
		if(obj.subCompanyId){
			str+=` AND subCompanyId='${obj.subCompanyId}'`
		}
		if(obj.name){
			str+=` AND deviceName='${obj.name}'`
		}
		if(obj.type){
			str+=` AND deviceModel='${obj.type}'`
		}
		if(obj.num){
			str+=` AND deviceNum='${obj.num}'`
		}
		let sql = `select count(*) as count from ROMS_SZ_DEVICE ${str}`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function queryAllDeviceType(type,res){
	console.log('------------查询设备类型列表---------')
	let sql = 'select id,name,num from ROMS_SZ_DEVICETYPE where deviceMainId= ? order by createtime asc'
		pool.query(sql,[type],(err,rows,field)=>{
			if(err){
				console.log('-----------查询设备类型报错-------',err)
				res.json({devices:{}})
			}
			console.log(rows)
			res.json({devices:rows})
		})
}

function queryDeviceTypeByTaskId(taskId){
	let sql = 'select deviceTypeId from ROMS_SZ_TASKAUTH where taskId = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskId],(err,rows)=>{
			if(err)reject(err)
            //console.log(rows)
			resolve(rows[0])

		})
	})
}
function queryNameById(deviceTypeId){
	
	let sql = 'select a.deviceMainId,a.name,b.name as mainTypeName from ROMS_SZ_DEVICETYPE a join ROMS_SZ_DEVICEMAIN b on a.deviceMainId=b.id where a.id = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[deviceTypeId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0])
		})
	})
}

async function queryDeviceTypeInfoByTask(taskId){
	try{
		let deviceTypeInfo = await queryDeviceTypeByTaskId(taskId)
		let deviceTypeName;
		let deviceTypeId;
		let deviceMainId;
		let mainTypeName;
		if(!deviceTypeInfo){
			deviceTypeName = ''
			deviceTypeId = ''
		}else{
			deviceTypeId=deviceTypeInfo.deviceTypeId
			let deviceType = await queryNameById(deviceTypeInfo.deviceTypeId)
			deviceTypeName = deviceType.name
			deviceMainId =  deviceType.deviceMainId
			mainTypeName = deviceType.mainTypeName
		}	
		let obj={
			deviceTypeId:deviceTypeId,
			deviceTypeName:deviceTypeName,
			mainTypeName:mainTypeName,
			deviceMainId:deviceMainId
		}
		return obj
	}catch(err){
		console.log(err)		
		return {
			deviceTypeId:'',
			deviceTypeName:''
		}
	}
	
}






