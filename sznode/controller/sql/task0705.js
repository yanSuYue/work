const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime
//getbeforetime
const getbeforetime = require('../public/timeParse.js').getbeforetime
const parseTime = require('../public/timeParse.js').parseTime
const parseTime2 = require('../public/timeParse.js').parseTime2
const parseLittleTime = require('../public/timeParse.js').parseLittleTime
const parseMoreTime = require('../public/timeParse.js').parseMoreTime
const nodeExcel = require('excel-export');

const template = require('./template.js')
const device = require('./device.js')
const info = require('./info.js')

const task = {}
module.exports = task

task.deleteTaskStaff = deleteTaskStaff
task.excel = excel
task.updateInfo = updateInfo
task.updateIsSend = updateIsSend
task.nowstate = nowstate
task.nopassSure2 = nopassSure2
task.copyTask = copyTask
task.addDiffTaskInfo = addDiffTaskInfo
task.showtasks = showtasks
task.showtasks2 = showtasks2
task.queryTaskByProjectId = queryTaskByProjectId
task.queryTaskIdByProjectId = queryTaskIdByProjectId
task.addTask = addTask
task.refreshIsSend = refreshIsSend
task.queryTaskByTimeWithInfo = queryTaskByTimeWithInfo
task.passTask = passTask
task.showceshitask = showceshitask
task.queryTaskIdByProjectIdPassed = queryTaskIdByProjectIdPassed
task.queryTaskHasDoc = queryTaskHasDoc
task.deleteTask = deleteTask
task.addDeviateSql = addDeviateSql


function getdeviceArr(id){
	return new Promise((resolve,reject)=>{
		let sql = `select deviceTypeId from ROMS_SZ_STAFFAUTH where staffId = '${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve([])
			}			
		})
	})
}
//distribute的任务列表
function getTaskInfo2(req,res){
	return new Promise((resolve,reject)=>{
		let subcompanyId = req.query.companyid
		let str = `TA.subcompanyId='${subcompanyId}'AND TA.isSend=1`
		if(req.query.city){
			str+=` AND TA.district='${req.query.city}'`
		}
		if(req.query.keyword){
			str+=` AND TA.checkUnitName='${req.query.keyword}'`
		}

		if(req.query.deviceType){
			str+=` AND TYPE.name='${req.query.deviceType}'`
		}

		if(req.query.user){
			str+=` AND STAFF.staffName='${req.query.user}'`
		}

		if(req.query.address){
			str+=` AND TA.address='${req.query.address}'`
		}

		if(req.query.time1){
			starttime = parseTime(req.query.time1)
			endtime = parseTime(req.query.time2)
			str+=` and TA.expectTime between '${starttime}' and '${endtime}'`
		}
		let sql = `SELECT MAIN.name as showType, TYPE.name as typename,TYPE.id as deviceTypeId ,STAFF.staffName,TA.* from ROMS_SZ_TASK TA join ROMS_SZ_TASKAUTH AUTH
		on TA.id=AUTH.taskId join ROMS_SZ_PROJECT PRO on PRO.id=TA.projectId join ROMS_SZ_STAFF STAFF on STAFF.id=PRO.staffId
		join ROMS_SZ_DEVICETYPE TYPE on TYPE.id = AUTH.deviceTypeId join ROMS_SZ_DEVICEMAIN MAIN on MAIN.id=TYPE.deviceMainId where ${str}
		order by TA.createtime,district`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}



async function excel(req,res){
	console.log(req.query)
	let taskInfo=await getTaskInfo2(req,res)
	let taskInfos=taskInfo.map(async (item)=>{
		let user = await getStaffP(item.id)
		let str=``
		for(let i=0;i<user.length;i++){
			str=str+`${user[i].staffName},`
		}
		item.user=str
		return item
	})
	Promise.all(taskInfos).then(results=>{
		var conf ={};
		// uncomment it for style example  
		// conf.stylesXmlFile = "styles.xml";
		  conf.cols = [{
			  caption:'受检单位',
			  captionStyleIndex: 1,        
			  type:'string',
			  beforeCellWrite:function(row, cellData){
				  return cellData;
			  }
			  , width:25
		  },{
			caption:'地区',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:15
		},{
			caption:'设备类型',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				 return cellData;
			}
			, width:15
		},{
			caption:'项目管理员',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:65
		},{
			caption:'客户联系人',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:25
		},{
			caption:'联系电话',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:105
		},{
			caption:'检测人员',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:95
		},{
			caption:'类型',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:15
		},{
			caption:'检测类型',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:15
		},{
			caption:'安排检测时间',
			captionStyleIndex: 1,        
			type:'string',
			beforeCellWrite:function(row, cellData){
				return cellData;
			}
			, width:105
		}];
		  conf.rows = [];
		  for(let i=0;i<results.length;i++){
			let arr=[];
			arr[0]=results[i].checkUnitName
			arr[1]=results[i].district
			arr[2]=results[i].typename
			arr[3]=results[i].staffName
			arr[4]=results[i].checkUnitContact
			arr[5]=results[i].checkUnitPhone
			arr[6]=results[i].user.substring(0,results[i].user.length-1)
			arr[7]=results[i].showType
			arr[8]=results[i].monitorType
			arr[9]=getbeforetime(results[i].needTime)
			conf.rows.push(arr)
		  }
		var result = nodeExcel.execute(conf);
		res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		res.setHeader("Content-Disposition", "attachment; filename=" + `${makeDateTime().time}.xlsx`);
		res.end(result, 'binary');
	})
}


function nowstate(obj,res){
	let sql=`SELECT STATE.*,STAFF.staffName FROM ROMS_SZ_TASKSTATE STATE join ROMS_SZ_STAFF STAFF on STAFF.id=STATE.staffId where taskId='${obj.id}' order by STATE.createtime asc`
	new Promise(()=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				res.json(rows)
			}
			else{
				res.json([])
			}
		})
	})
}

function updateSend(id){
	return new Promise((resolve,reject)=>{
		let createtime = makeDateTime().time
		let sql = `update ROMS_SZ_TASK set enterTime='${createtime}',isSend=0 where id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
async function updateIsSend(obj,res){
	let [updateSend2,addTaskStaff32]=await Promise.all([updateSend(obj.id),addTaskStaff3(obj.id,obj.staffId,'任务可派发')])
	Promise.all([updateSend2,addTaskStaff32]).then(e=>{
		res.json({success:true,msg:'任务进入派发列表！'})
	}).catch(e=>{
		res.json(e)
	})
	
}
//查询所有任务条数
function countTask(obj,deviceArr){
	let starttime;
	let endtime;
	let sql;

	let str3=``;
	let str4=``
	for(let i=0;i<deviceArr.length;i++){
		if(i==deviceArr.length-1){
			str3+=`AUTH.deviceTypeId='${deviceArr[i].deviceTypeId}'`
		}else{
			str3+=`AUTH.deviceTypeId='${deviceArr[i].deviceTypeId}' or `
		}
	}
	if(str3.length){
		str4 = ` AND (${str3})`
	}
	if(obj.keyWord.length){
		str4+=` AND TASK.checkUnitName = '${obj.keyWord}'`
	}
	if(obj.state!==3){
		str4+=` AND TASK.pass = '${obj.state}'`
	}
	if(obj.projectNum.length){
		str4+=` AND TASK.projectNum = '${obj.projectNum}'`
	}
	if(obj.time&&obj.time[0]){
		starttime = parseLittleTime(obj.time[0])
		endtime = parseMoreTime(obj.time[1])
		sql=`select count(*) as count from ROMS_SZ_TASK TASK join ROMS_SZ_TASKAUTH AUTH 
		on AUTH.taskId=TASK.id where  TASK.createtime between '${starttime}' and '${endtime}' ${str4}`
	}else{
		sql=`select count(*) as count from ROMS_SZ_TASK TASK join ROMS_SZ_TASKAUTH AUTH 
		on AUTH.taskId=TASK.id where 1=1 ${str4}`
	}
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				
				resolve(rows[0].count)
			}
			else{
				resolve(0)
			}
		})
	})
}
function addPianli(req,res){
	return new Promise((resolve,reject)=>{
		let id = uuid()
		let sqlStr=`id`
		let sqlVal=`'${id}'`
		for(let item in req.body){
			sqlStr+=`,${item}`
			sqlVal+=`,'${req.body[item]}'`
		}
		let sql=`insert into ROMS_SZ_APPLY (${sqlStr}) VALUES (${sqlVal}) `
		pool.query(sql,(err,rows,field)=>{
			if(err){
				res.json({success:false})
			}
			if(rows){
				resolve(rows)
				//res.json({success:true,msg:'成功添加偏离表！'})
			}else{
				res.json({success:false})
			}			
		})
	})
}
function updateState(req,res){
	//isDeviate
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_TASK set isDeviate=1 where id='${req.body.taskId}'`
		pool.query(sql,(err,rows,field)=>{
			if(err){
				res.json({success:false})
			}
			if(rows){
				resolve(rows)
				//res.json({success:true,msg:'成功添加偏离表！'})
			}else{
				res.json({success:false})
			}			
		})
	})
}
async function addDeviateSql(req,res){
	let [p1,p2]=await [updateState(req,res),addPianli(req,res)]
	Promise.all([p1,p2]).then(e=>{
		res.json({success:true,msg:'成功添加偏离表！'})
	}).catch(e=>{
		res.json({success:false,msg:'添加偏离表失败！'})
	})
}
//distribute的任务列表
function getTaskInfo(req,res){
	return new Promise((resolve,reject)=>{
		let pageSize = req.body.pageSize
		let nowPage = req.body.nowPage
		let subcompanyId = req.body.subCompanyId
		let start = pageSize*nowPage;
		let end = 10;
		let str = subcompanyId===null?'1=1': `TA.subcompanyId='${subcompanyId}'`
		let orderby='';
		if(req.body.flag==1){
			str+=` AND TA.isSend=1`
			orderby='TA.needTime'
		}else{
			str+=` AND TA.isSend=0`
			orderby='TA.enterTime desc,district,TA.expectTime desc'
		}
		if(req.body.searchForm.city.length){
			str+=` AND TA.district='${req.body.searchForm.city[2]}'`
		}
		if(req.body.searchForm.keyword.length){
			str+=` AND TA.checkUnitName='${req.body.searchForm.keyword}'`
		}

		if(req.body.searchForm.deviceType.length){
			str+=` AND TYPE.name='${req.body.searchForm.deviceType}'`
		}

		if(req.body.searchForm.user.length){
			str+=` AND STAFF.staffName='${req.body.searchForm.user}'`
		}

		if(req.body.searchForm.address.length){
			str+=` AND TA.address='${req.body.searchForm.keyword}'`
		}

		if(req.body.searchForm.time.length&&req.body.searchForm.time[0]!==null){
			starttime = parseLittleTime(req.body.searchForm.time[0])
			endtime = parseMoreTime(req.body.searchForm.time[1])
			str+=` and TA.expectTime between '${starttime}' and '${endtime}'`
		}
		let sql = `SELECT TYPE.deviceMainId, TYPE.name as typename,TYPE.id as deviceTypeId ,STAFF.staffName,TA.* from ROMS_SZ_TASK TA left join ROMS_SZ_TASKAUTH AUTH
		on TA.id=AUTH.taskId join ROMS_SZ_PROJECT PRO on PRO.id=TA.projectId join ROMS_SZ_STAFF STAFF on STAFF.id=PRO.staffId
		left join ROMS_SZ_DEVICETYPE TYPE on TYPE.id = AUTH.deviceTypeId where ${str}
		order by ${orderby} limit ${start},${end}`

		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}

//distribute的任务列表
function getTaskInfo4(req,res){
	return new Promise((resolve,reject)=>{
		let pageSize = req.body.pageSize
		let nowPage = req.body.nowPage
		let subcompanyId = req.body.subCompanyId
		let needTime = req.body.needtime
		let start = pageSize*nowPage;
		let end = 10;
		let str = `needTime between '${parseLittleTime(needTime)}' AND '${parseMoreTime(needTime)}' AND TA.subcompanyId='${subcompanyId}'`
		let orderby='';
		str+=` AND TA.isSend=1`

		let sql = `SELECT TYPE.deviceMainId,MAIN.name as showType, TYPE.name as typename,TYPE.id as deviceTypeId ,STAFF.staffName,TA.id,TA.monitorType,TA.checkUnitPhone,TA.checkUnitName,TA.checkUnitContact from ROMS_SZ_TASK TA  join ROMS_SZ_TASKAUTH AUTH
		on TA.id=AUTH.taskId join ROMS_SZ_PROJECT PRO on PRO.id=TA.projectId join ROMS_SZ_STAFF STAFF on STAFF.id=PRO.staffId
		join ROMS_SZ_DEVICETYPE TYPE on TYPE.id = AUTH.deviceTypeId join ROMS_SZ_DEVICEMAIN MAIN on MAIN.id=TYPE.deviceMainId where ${str}
		order by ${orderby} STAFF.staffName limit ${start},${end}`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}


function taskCounts(req){
	return new Promise((resolve,reject)=>{
		let subcompanyId = req.body.subCompanyId
		let str = `TA.subcompanyId='${subcompanyId}'`
		if(req.body.flag==1){
			str+=` AND TA.isSend=1`
		}else{
			str+=` AND TA.isSend=0`
		}
		if(req.body.searchForm.city.length){
			str+=` AND TA.district='${req.body.searchForm.city[2]}'`
		}
		if(req.body.searchForm.keyword.length){
			str+=` AND TA.checkUnitName='${req.body.searchForm.keyword}'`
		}

		if(req.body.searchForm.deviceType.length){
			str+=` AND TYPE.name='${req.body.searchForm.deviceType}'`
		}

		if(req.body.searchForm.user.length){
			str+=` AND STAFF.staffName='${req.body.searchForm.user}'`
		}

		if(req.body.searchForm.address.length){
			str+=` AND TA.address='${req.body.searchForm.keyword}'`
		}

		if(req.body.searchForm.time.length&&req.body.searchForm.time[0]!==null){
			starttime = parseLittleTime(req.body.searchForm.time[0])
			endtime = parseMoreTime(req.body.searchForm.time[1])
			str+=` and TA.expectTime between '${starttime}' and '${endtime}'`
		}
		let sql = `SELECT count(*) as count from ROMS_SZ_TASK TA left join ROMS_SZ_TASKAUTH AUTH
		on TA.id=AUTH.taskId join ROMS_SZ_PROJECT PRO on PRO.id=TA.projectId join ROMS_SZ_STAFF STAFF on STAFF.id=PRO.staffId
		left join ROMS_SZ_DEVICETYPE TYPE on TYPE.id = AUTH.deviceTypeId where ${str}`

		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}
function taskCounts4(req){
	return new Promise((resolve,reject)=>{
		let subcompanyId = req.body.subCompanyId
		let needTime = req.body.needtime
		let str = `needTime between '${parseLittleTime(needTime)}' AND '${parseMoreTime(needTime)}' AND TA.subcompanyId='${subcompanyId}'`
		str+=` AND TA.isSend=1`

		let sql = `SELECT count(*) as count from ROMS_SZ_TASK TA  join ROMS_SZ_TASKAUTH AUTH
		on TA.id=AUTH.taskId join ROMS_SZ_PROJECT PRO on PRO.id=TA.projectId join ROMS_SZ_STAFF STAFF on STAFF.id=PRO.staffId
		join ROMS_SZ_DEVICETYPE TYPE on TYPE.id = AUTH.deviceTypeId join ROMS_SZ_DEVICEMAIN MAIN on MAIN.id=TYPE.deviceMainId where ${str}`
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}
function getStaffP(id){
	return new Promise((resolve,reject)=>{
		let sql=`select STAFF.staffName from ROMS_SZ_TASKSTAFF TASKSTAFF join ROMS_SZ_STAFF STAFF on STAFF.id= TASKSTAFF.staffId where TASKSTAFF.taskId='${id}' AND TASKSTAFF.type=0 `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}
async function showtasks(req,res){
	let [taskInfo,count]=await Promise.all([getTaskInfo(req,res),taskCounts(req)])
	let taskInfos=taskInfo.map(async (item)=>{
		let user = await getStaffP(item.id)
		let arr = []
		for(let i=0;i<user.length;i++){
			arr.push(user[i].staffName)
		}
		item.user=arr.join(',')
		return item
	})
	Promise.all(taskInfos).then(results=>{
		res.json({result:results,count:count[0].count})
	})

}
//showceshitask
async function showceshitask(req,res){
	let taskgroup=await gettaskId(req.body)
	let count=await getcounttaskId(req.body)
	res.json({result:taskgroup,count})
}

function getcounttaskId(obj){
	return new Promise((resolve,reject)=>{
		//searchForm
		let id = obj.staffId
		let str = ``
		let aaa='';
		if(obj.searchForm.city.length){
			str+=`AND task.district='${obj.searchForm.city[2]}'`
		}
		if(obj.searchForm.user){
			str+=`AND  name.staffName='${obj.searchForm.user}'`
		}
		if(obj.searchForm.keyword){
			str+=`AND task.checkUnitName='${obj.searchForm.keyword}'`
		}
		//判断：未检 0、已检未上传 1、已检上传2；
		if(obj.searchForm.taskState==0){
			aaa=`AND isDone=0`;
		}else if(obj.searchForm.taskState==1){
			aaa=`AND isDone=1 AND data is null`;
		}else if(obj.searchForm.taskState==2){
			aaa=`AND isDone=1 AND data is not null`;
		}
		/*let sql = `select count(*) as count from ROMS_SZ_TASKSTAFF staff
		join ROMS_SZ_TASK task on task.id=staff.taskId join ROMS_SZ_PROJECT project on project.id=task.projectId join ROMS_SZ_STAFF name on name.id=project.staffId
		where task.pass=${obj.searchForm.state} AND staff.type=0 AND staff.staffId='${id}' ${str}`*/
		let sql = `select count(*) as count from ROMS_SZ_TASKSTAFF staff
		join ROMS_SZ_TASK task on task.id=staff.taskId join ROMS_SZ_PROJECT project on project.id=task.projectId join ROMS_SZ_STAFF name on name.id=project.staffId
		where task.pass=${obj.searchForm.state} AND staff.type=0 ${aaa} AND staff.staffId='${id}' ${str}`
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0].count)
		})
	})
}


function gettaskId(obj){
	return new Promise((resolve,reject)=>{
		let id = obj.staffId
		let start = obj.nowPage*10
		let str = ``
		if(obj.searchForm.city.length){
			str+=` AND task.district='${obj.searchForm.city[2]}'`
		}
		if(obj.searchForm.user){
			str+=` AND  name.staffName='${obj.searchForm.user}'`
		}
		if(obj.searchForm.keyword){
			str+=`AND task.checkUnitName='${obj.searchForm.keyword}'`
		}
		let sql = `select project.docDisplayUrl,name.staffName,task.checkDeviceName,task.checkUnitAddress,task.checkUnitName,task.checkUnitContact,task.checkUnitPhone,task.docNum,
		task.expectTime,task.projectNum,task.note1,task.district from ROMS_SZ_TASKSTAFF staff
		join ROMS_SZ_TASK task on task.id=staff.taskId join ROMS_SZ_PROJECT project on project.id=task.projectId join ROMS_SZ_STAFF name on name.id=project.staffId
		where task.pass=${obj.searchForm.state} AND staff.type=0 AND staff.staffId='${id}' ${str} limit ${start},10`
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}


async function showtasks2(req,res){
	let [taskInfo,count]=await Promise.all([getTaskInfo4(req,res),taskCounts4(req)])
	let taskInfos=taskInfo.map(async (item)=>{
		let user = await getStaffP(item.id)
		let str=``
		for(let i=0;i<user.length;i++){
			str=str+`${user[i].staffName},`
		}
		item.user=str
		return item
	})
	Promise.all(taskInfos).then(results=>{
		res.json({result:results,count:count[0].count})
	})

}
//查询项目下的所有任务(基本废弃，已经不关注任务的具体数据)
function queryTaskByProjectId(id){
	return new Promise((resolve,reject)=>{
		pool.query('select * from ROMS_SZ_TASK where projectId = ? and unusable = 0',[id],(err,rows,field)=>{
			if(err)reject(err)
			rows.forEach((item)=>{
				item.createtime = parseTime(item.createtime)
			})
			resolve(rows)
		})
	})
}

//通过projectId查询下挂任务的基本信息
function queryAllTaskByProject(obj){
	return new Promise((resolve,reject)=>{
		let starttime
		let endtime
		let sql
		let params
		sql=`select SZSTAFF.staffName,TASK.* from ROMS_SZ_TASK TASK join ROMS_SZ_TASKSTAFF STAFF on TASK.id=STAFF.TASKId join ROMS_SZ_STAFF SZSTAFF on SZSTAFF.id=STAFF.staffId where STAFF.type=2 AND projectId = ? `
		params=[obj.id]
		pool.query(sql,params,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
					item.createtime = parseTime(item.createtime)
				})
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}

//项目下已通过审核的任务
function queryAllTaskByProjectPassed(projectId,globalType){
	return new Promise((resolve,reject)=>{
		pool.query('select DOC.id as docId,TYPE.deviceMainId, TASK.*,DOC.docPdfUrl,DOC.id as docId,DOC.size from ROMS_SZ_TASK TASK left join ROMS_SZ_DOC DOC on DOC.taskId=TASK.id join ROMS_SZ_TASKAUTH AUTH on AUTH.taskId=TASK.id join ROMS_SZ_DEVICETYPE TYPE on TYPE.id=AUTH.deviceTypeId where TASK. pass = 2 and TASK.unusable = 0 and TASK. projectId = ?',[projectId],(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
					item.createtime = parseTime(item.createtime)
					item.globalType = globalType
				})
				resolve(rows)
			}else{
				resolve(null)
			}
			
		})
	})
}

//项目下已生成报告的任务
function queryAllTaskHasDoc(projectId){
	return new Promise((resolve,reject)=>{
		pool.query('select id,createtime,checkUnitName,docUrl,measureDataUrl from ROMS_SZ_TASK where projectId = ? and pass = 2 and unusable = 0 and docUrl IS NOT NULL ',[projectId],(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
				item.createtime = parseTime(item.createtime)
				})
				resolve(rows)
			}else{
				resolve(null)
			}			
		})
	})
}

function isDeviate(id){
	return new Promise((resolve,reject)=>{
		let sql=`select count(*) as isDeviate from ROMS_SZ_APPLY where taskId='${id}' and pass<>2`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0].isDeviate)
		})
	})
}
async function addTaskCopy(taskInfo,type){

	let createtime = makeDateTime().time
	let id = uuid()
	let projectId=taskInfo[0].projectId
	let str=`createtime,id`
	let values=`'${createtime}','${id}'`
	let [foo, bar] = await Promise.all([getStr2(taskInfo[0].projectId,type),getStr1(taskInfo[0].projectId)]);

	let str1=foo[0].num+1<10?'0'+(foo[0].num+1):foo[0].num+1
	let st3=foo[0].num+1
	
	if(str1=='0null'){
		str1='01'
		st3=1
	}
	let str2=''
	if(bar[0].num<10){
		str2='000'+bar[0].num
	}else if(bar[0].num<100){
		str2='00'+bar[0].num
	}else if(bar[0].num<1000){
		str2='0'+bar[0].num
	}else{
		str2=bar[0].num
	}
	
	
	//根据设备类别去判断编号显示对应的检测类型编号
	let projectNum;
	if(type == 5){
		projectNum='RD0218' +str2+'JX'+str1
	}else{
		projectNum='RD0218' +str2+'JF'+str1
	}
	
	//let projectNum='RD0218' +str2+'FW'+str1
	taskInfo[0].projectNum=projectNum
	taskInfo[0].isSend=3
	taskInfo[0].taskNum=st3
	for(let item in taskInfo[0]){
		if(taskInfo[0][item]!==null){
			str+=`,${item}`
			values+=`,'${taskInfo[0][item]}'`
		}
	}
	let sql=`insert into ROMS_SZ_TASK (${str}) values(${values}) `
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve({id:id,createtime:createtime})
		})
	})
}
async function copyTask(req,res){
	let isobj={
		templateId:req.body.templateId,
		deviceTypeId:req.body.deviceTypeId
	}
	let taskInfo=await copyTaskInfo(req.body.currentTaskId)
	//因为是复制的任务，所以要把standard给更新为模板对于的standard
	let templateType = await template.queryAllTemplateByDevice(req.body.deviceTypeId)
	console.log("templateType.length="+templateType.length);
	if(templateType.length>0)
	{
		console.log("templateType.standard="+templateType[0].standard);
		taskInfo[0].standard=templateType[0].standard
	}


	let newtask=await addTaskCopy(taskInfo,req.body.type)
	await addTaskStaff2(newtask.id,req.body.staffId)
	await addTaskStaff3(newtask.id,req.body.staffId,'复制任务')
	//关联任务和设备类型、模板
	let templateDevice = await addDeviceTemplate(isobj,newtask)
	//获取本任务对应的类型名和模板名 用于UI异步刷新
	let deviceName = await device.queryNameById(isobj.deviceTypeId)
	let templateName = await template.queryNameById(isobj.templateId)
	newtask['templateName'] = templateName.name
	newtask['deviceTypeName'] = deviceName.name
	res.json({taskInfo:newtask,success:true,msg:'任务信息复制完成'})
}

function copyTaskInfo(id){
	return new Promise((resolve,reject)=>{
		let sql=`select projectId,standard,testingProject,checkUnitName,city,district,province,
		checkUnitAddress,subcompanyId,address,lat, lng,checkUnitPhone,checkUnitContact from ROMS_SZ_TASK where id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function taskState(id){
	return new Promise((resolve,reject)=>{
		let sql=`SELECT STATE.*,STAFF.staffName FROM ROMS_SZ_TASKSTATE STATE join ROMS_SZ_STAFF STAFF on STAFF.id=STATE.staffId WHERE taskId='${id}' ORDER BY createtime DESC LIMIT 0,1`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0])
		})
	})
}

async function queryTaskIdByProjectId(obj){
	//获取到下挂的所有任务
	let taskIds = await queryAllTaskByProject(obj)
	if(taskIds){
		//查询到每一个id的新关联的子类信息和模板信息
		taskInfo = taskIds.map(async(item)=>{
			let device_obj = await device.queryDeviceTypeInfoByTask(item.id)
			let state = await taskState(item.id)
			let template_obj = await template.queryTemplateInfoByTask(item.id)
			let applay = await isDeviate(item.id)
			item['createtime'] = item.createtime
			item['applay'] = applay
			item['state'] = state
			item['mainTypeName'] = device_obj.mainTypeName
			item['deviceMainId'] = device_obj.deviceMainId
			item['checkUnitName'] = item.checkUnitName
			item['isSend'] = item.isSend
			item['globalType'] = obj.globalType
			item['isDone'] = item.isDone
			item['deviceTypeId'] = device_obj.deviceTypeId
	       	item['deviceTypeName'] = device_obj.deviceTypeName
	       	item['templateId'] = template_obj.templateId
			item['templateName'] = template_obj.templateName
			item['templateNum'] = template_obj.templateNum
	       	return item
		})
		return Promise.all(taskInfo)	
	}else{
		return []
	}	
}
//已通过审核的
async function queryTaskIdByProjectIdPassed(id,globalType){
	//获取到下挂的所有已通过审核的任务
	let taskIds = await queryAllTaskByProjectPassed(id,globalType)
	if(taskIds){
		//查询到每一个id的新关联的子类信息和模板信息
		taskInfo = taskIds.map(async(item)=>{
		let device_obj = await device.queryDeviceTypeInfoByTask(item.id)
		let template_obj = await template.queryTemplateInfoByTask(item.id)
		item['projectId'] = id
		item['createtime'] = item.createtime
		item['checkUnitName'] = item.checkUnitName
		item['isSend'] = item.isSend
		item['deviceTypeId'] = device_obj.deviceTypeId
       	item['deviceTypeName'] = device_obj.deviceTypeName
       	item['templateId'] = template_obj.templateId
       	item['templateName'] = template_obj.templateName
       	return item
		})
		return Promise.all(taskInfo)	
	}else{
		return []
	}
	
}

//查询所有已经生成任务
async function queryTaskHasDoc(id){

	//获取到下挂的所有已通过审核的任务
	let taskIds = await queryAllTaskHasDoc(id)
	if(taskIds){
		//查询到每一个id的新关联的子类信息和模板信息deviceTypeName
		taskInfo = taskIds.map(async(item)=>{
			let device_obj = await device.queryDeviceTypeInfoByTask(item.id)
			let template_obj = await template.queryTemplateInfoByTask(item.id)
			item['createtime'] = item.createtime
			item['checkUnitName'] = item.checkUnitName
			item['isSend'] = item.isSend
			item['deviceTypeId'] = device_obj.deviceTypeId
	       	item['deviceTypeName'] = device_obj.deviceTypeName
	       	item['templateId'] = template_obj.templateId
	       	item['templateName'] = template_obj.templateName
	       	return item
		})
		return Promise.all(taskInfo)	
	}else{
		return []
	}
	
}


//通过时间排序任务
function queryTasksByCtime(obj,deviceArr){
	let starttime;
	let endtime;
	let sql;
	let size = obj.pageSize;
	let index = obj.pageIndex;
	let indexEnd;
	let	indexStart;
		indexStart = size*index;
		indexEnd = size;

	let str3=``;
	let str4=``;
	let str5=``;
	for(let i=0;i<deviceArr.length;i++){
		if(i==deviceArr.length-1){
			str3+=`AUTH.deviceTypeId='${deviceArr[i].deviceTypeId}'`
		}else{
			str3+=`AUTH.deviceTypeId='${deviceArr[i].deviceTypeId}' or `
		}
	}
	if(str3.length){
		str4 = ` AND (${str3})`
	}
	if(obj.keyWord.length){
		str4+=` AND TASK.checkUnitName = '${obj.keyWord}'`
	}
	if(obj.state!==3){
		str4+=` AND TASK.pass = ${obj.state}`
	}
	if(obj.projectNum.length){
		str4+=` AND TASK.projectNum = '${obj.projectNum}'`
	}
	if(obj.time&&obj.time[0]){
		starttime = parseLittleTime(obj.time[0])
		endtime = parseMoreTime(obj.time[1])
		sql=`select TASK.reason,TASK.projectNum,TASK.docNum,TASK.id,TASK.createtime,TASK.checkUnitName,TASK.pass,TASK.measureDataPdfUrl as pdfUrl from ROMS_SZ_TASK TASK join ROMS_SZ_TASKAUTH AUTH 
		on AUTH.taskId=TASK.id
		where TASK.createtime between '${starttime}' and '${endtime}' ${str4} order by
		TASK.createtime desc limit ${indexStart},${indexEnd}`
	}else{
		sql=`select TASK.reason,TASK.projectNum,TASK.docNum,TASK.id,TASK.createtime,TASK.checkUnitName,TASK.pass,TASK.measureDataPdfUrl as pdfUrl from ROMS_SZ_TASK TASK join ROMS_SZ_TASKAUTH AUTH 
		on AUTH.taskId=TASK.id
		where 1=1 ${str4} order by TASK.createtime desc limit ${indexStart},${indexEnd}`
	}
	return new Promise((resolve,reject)=>{
		console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)

			rows.forEach((item)=>{
				item.createtime = parseTime(item.createtime)
			})
			resolve(rows)
		})
	})
}
async function queryTaskByTimeWithInfo(obj,res){
	let id=obj.staffId==null?'92c1821c-18e9-435c-87a4-f71c6a51ba03':obj.staffId
	let deviceArr = await getdeviceArr(id)
	if(deviceArr.length===0){
		res.json({tasks:[],count:0})
		return false;
	}

	let count = await countTask(obj,deviceArr)
	let rawTask = await queryTasksByCtime(obj,deviceArr)
 	let _rawTask = rawTask.map(async(item)=>{
		let device_obj = await device.queryDeviceTypeInfoByTask(item.id)
		let projectId = await getprojectid(item.id)
		//let docDisplayUrl = await getprojectid(item.docDisplayUrl)
		let template_obj = await template.queryTemplateInfoByTask(item.id)
		item.projectId=projectId[0].id
		item.docDisplayUrl=projectId[0].docDisplayUrl
		item.deviceMainId=device_obj.deviceMainId
		item['deviceTypeId'] = device_obj.deviceTypeId
       	item['deviceTypeName'] = device_obj.deviceTypeName
       	item['templateId'] = template_obj.templateId
       	item['templateName'] = template_obj.templateName
       	return item
 	})

 	Promise.all(_rawTask)
 	.then((rows)=>{
 		res.json({tasks:rows,count:count})
 	})
 	.catch(err=>{
 		res.json({tasks:[],count:0})
 		console.log(err)
 	})
}

function getprojectid(id){
	return new Promise((resolve,reject)=>{
		let sql = `SELECT pro.docDisplayUrl,pro.id,pro.projectNum FROM ROMS_SZ_PROJECT pro JOIN ROMS_SZ_TASK task ON task.projectId=pro.id where task.id='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows)
				console.log(rows[0].id)
			}else{
				resolve(null)
			}			
		})
	})
}

function passTaskUpdate(obj){
	new Promise((resolve,reject)=>{
		let sql = 'update ROMS_SZ_TASK set pass = ? where id = ?'
		pool.query(sql,[obj.pass,obj.taskId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
async function passTask(obj,res){
	
	await Promise.all([passTaskUpdate(obj),addTaskStaff3(obj.taskId,obj.staffId,'原始记录表审核通过')])
	res.json({success:true,msg:'更新成功'})
}


//查询该任务所属项目下的任务是否均已完成 更新audit字段
function isAllTaskPassed(obj){
	if(obj.pass==1) return ;
	let _projectId
	let allIsPass = function(id){
		new Promise((resolve,reject)=>{
			let sql = 'select pass from ROMS_SZ_TASK where projectId = ?'
			pool.query(sql,[id],(err,rows)=>{
				if(err)reject(err)
				let rowsx = rows.map((item)=>{
					return item.pass
				})
				resolve(rowsx)
			})
		})
	}
	let refreshAudit = function(rows,id){
		if(rows.indexOf('0')!=-1||rows.indexOf('1')!=-1){
			return 0 ;
		}
		return new Promise((resolve,reject)=>{
			let sql = 'update ROMS_SZ_PROJECT set audit = 1 where id = ?'
			pool.query(sql,[id],(err,rows)=>{
				if(err)reject(err)
				resolve({msg:'update audit success',success:true})
			})
		})
	}

	let projectId = new Promise((resolve,reject)=>{
		let sql = 'select projectId from ROMS_SZ_TASK where id = ?'
		pool.query(sql,[obj.taskId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0].projectId)
		})
	})
	projectId
	.then((id)=>{
		_projectId = id
		allIsPass(id)
	})
	.then((rowsx)=>{
		refreshAudit(rowsx,_projectId)
	})
	.then((msg)=>console.log(msg))
	.catch(err=>{
		console.log(err)
	})

}

//查询某个任务的信息
function queryTaskInfoById(id){
	return new Promise((resolve,reject)=>{
		pool.query('select * from ROMS_SZ_TASK where id = ? and unusable = 0',(err,rows,field)=>{
			if(err)reject(err)
			rows.forEach((item)=>{
				item.createtime = parseTime(item.createtime)
			})
			resolve(rows)
		})
	})
}

//任务的所属的子类 模板类型
function querySomeTaskInfoById(taskId){
	let sql = 'select templateId from ROMS_SZ_TASKAUTH where taskId = ? '
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskId],(err,rows,field)=>{
			if(err)reject(err)
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

//根据isDone 删除任务
function isTaskDone(id){
	return new Promise((resolve,reject)=>{
		let sql = 'select isDone from ROMS_SZ_TASK where id = ?'
		pool.query(sql,[id],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//nopassSure2

function nopassUpdateTask(obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_TASK set pass=1,reason='${obj.reason}' where id='${obj.id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
async function nopassSure2(obj,res){
	await Promise.all([nopassUpdateTask(obj),addTaskStaff3(obj.id,obj.staffId,'原始记录表审核不通过')])
	res.json({success:true,msg:'操作成功！'})
}

function deleteState(id){
	return new Promise((resolve,reject)=>{
		let sql=`delete from ROMS_SZ_TASKSTATE where taskId='${id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}

//查询任务是否绑定过人员
 function isBindStaff(obj){
	let staffId = obj.staffId
	let sql = 'delete from ROMS_SZ_TASKSTAFF where taskId = ? and type=0'
	let promises = obj.taskId.map((item)=>{
		return new Promise((resolve,reject)=>{
			pool.query(sql,[item],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows)
			})
		})		
	})
	return Promise.all(promises)
}

//添加人员任务关联表
async function addTaskStaff(obj){
	
	let result = await isBindStaff(obj)
	let sql = 'insert into ROMS_SZ_TASKSTAFF (createtime,id,staffId,taskId,type) values (?,?,?,?,?)'	
	let staffs = obj.staffs
	let taskIds = obj.taskId
	let createtime = makeDateTime().time
	let promises=[];
	for(let i=0;i<taskIds.length;i++){
		for(let k=0;k<staffs.length;k++){
			let id = uuid()
			let task = new Promise((resolve,reject)=>{
				pool.query(sql,[createtime,id,staffs[k],taskIds[i],0],(err,rows,field)=>{
					if(err)reject(err)
					resolve(rows)
				})
			})
			promises.push(task)
		}
			
	}
	return Promise.all(promises)	
}

//判断任务是否已派发 如果已派发则不可以再次派发
function taskHasSend(obj){
	let sql = 'select id,isSend,isDone from ROMS_SZ_TASK where id = ?'
	let promises = obj.taskId.map((item)=>{
		return new Promise((resolve,reject)=>{
			pool.query(sql,[item],(err,rows,field)=>{
				if(err)reject(err)
				resolve(rows[0].isDone)
			})
		})		
	})
	return Promise.all(promises)
}



//派发任务
function updateTaskState(needTime,item){
	return new Promise((resolve,reject)=>{
		let sql = `update ROMS_SZ_TASK set isSend = 1,needTime='${needTime}' where id = ?`
		console.log('**********************************************')
		console.log(sql)
		console.log('**********************************************')
		pool.query(sql,[item],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
async function refreshIsSend(obj,res){
	let hasTaskSend = await taskHasSend(obj)
	for(let i=0;i<hasTaskSend.length;i++){
		if(hasTaskSend[i]==1){
			res.json({success:false,msg:'任务派发失败,存在任务已同步平板,请刷新任务列表'})
			return;
		}
	}
	let taskAndStaff = await addTaskStaff(obj)
	let updateTaskSend = obj.taskId.map((item)=>{
		Promise.all([updateTaskState(parseLittleTime(obj.needTime),item),addTaskStaff3(item,obj.staffId,'任务派发')])
	})
	Promise.all(updateTaskSend)
	.then(()=>{
		res.json({success:true,msg:'任务派发成功'})
	})
	.catch(err=>{
		res.json({success:false,msg:'任务派发失败'})
		console.log(err)
	})
}

function getStr1(id){
	let sql = `select projectNum as num  from ROMS_SZ_PROJECT where id='${id}'`
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
function getStr2(id,deviceMainId){
	let sql = `select max(task.taskNum) as num from ROMS_SZ_TASK task,ROMS_SZ_TASKAUTH taskAuth,ROMS_SZ_DEVICETYPE deviceType where task.id=taskAuth.taskId and taskAuth.deviceTypeId=deviceType.id and task.projectId='${id}' and deviceType.deviceMainId='${deviceMainId}'`
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

async function addTaskInfo(obj,res){
	
	if(!obj.projectId||obj.projectId==''){
		res.json({success:false,msg:'projectId不能为空'})
		return;
	}
	let createtime = makeDateTime().time
	let id = uuid()
	let str=`createtime,id`
	let values=`'${createtime}','${id}'`
	let [foo, bar] = await Promise.all([getStr2(obj.projectId,obj.globalType),getStr1(obj.projectId)]);
	let str1=foo[0].num+1<10?'0'+(foo[0].num+1):foo[0].num+1
	let st3=foo[0].num+1
	if(str1=='0null'){
		str1='01'
		st3=1
	}
	let str2=''
	if(bar[0].num<10){
		str2='000'+bar[0].num
	}else if(bar[0].num<100){
		str2='00'+bar[0].num
	}else if(bar[0].num<1000){
		str2='0'+bar[0].num
	}else{
		str2=bar[0].num
	}
	
	//根据设备类别去判断编号显示对应的检测类型编号
	let projectNum;
	if(obj.globalType == 5){
		projectNum='RD0218' +str2+'JX'+str1
	}else{
		projectNum='RD0218' +str2+'JF'+str1
	}
	
	
//	obj.chartId=obj.imgid
	obj.templateId=null
	obj.globalType=null
	obj.lng=obj.mapLng
	obj.lat=obj.mapLat
	obj.taskNum=st3
	obj.mapLng=null
	obj.mapLat=null
	obj.isSend=3
	obj.projectNum=projectNum
	obj.expectTime = obj.expectTime===''?'':parseLittleTime(obj.expectTime)
	obj.deviceTypeId=null
	let staffId=obj.staffId
	
	console.log("nominalCapacity="+obj.nominalCapacity);
	console.log("nominalCapacity1="+obj.nominalCapacity1);
	delete obj.staffId
	for(let item in obj){
		if(obj[item]!==null){
			str+=`,${item}`
			values+=`,'${obj[item]}'`
		}
	}
	let sql=`insert into ROMS_SZ_TASK (${str}) values(${values}) `
	console.log("添加任务sql="+sql);
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve({id:id,createtime:createtime})
		})
	})
}

//添加设备模板关联表
function addDeviceTemplate(obj,cb){
	let sql = 'insert into ROMS_SZ_TASKAUTH (id,createtime,taskId,deviceTypeId,templateId) values (?,?,?,?,?)'
	let id = uuid()
	let createtime = makeDateTime().time
	let templateId = obj.templateId
	let deviceTypeId = obj.deviceTypeId
	let taskId = cb.id
	return new Promise((resolve,reject)=>{
		pool.query(sql,[id,createtime,taskId,deviceTypeId,templateId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//TODO
async function addTask(obj,res){
	if(!obj){
		return
	}
	let idObj={
		deviceTypeId:obj.deviceTypeId,
		templateId:obj.templateId
	}
	let taskInfo = await addTaskInfo(obj)

	let taskStaff = addTaskStaff(obj,taskInfo)
	let templateDevice = addDeviceTemplate(idObj,taskInfo)
	Promise.all([taskStaff,templateDevice])
	.then(([a,b])=>{
		
		res.json({msg:'任务派发成功',success:true})
	})
	.catch(err=>console.log(err))
}

function addTaskStaff2(taskId,staffId){
	return new Promise((resolve,reject)=>{
		let id = uuid()
		let createtime = makeDateTime().time
		let sql = `insert into ROMS_SZ_TASKSTAFF (createtime,id,staffId,taskId,type) values ('${createtime}','${id}','${staffId}','${taskId}',2)`	

		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function addTaskStaff3(taskId,staffId,state){
	return new Promise((resolve,reject)=>{
		let id = uuid()
		let createtime = makeDateTime().time
		let sql = `insert into ROMS_SZ_TASKSTATE (createtime,id,staffId,taskId,state) values ('${createtime}','${id}','${staffId}','${taskId}','${state}')`	

		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//仅添加任务信息  //todo
async function addDiffTaskInfo(query,res){
	let obj = query.data //任务数据
	let type = query.type //模板类型
	let taskInfo;
	let staffId = obj.staffId
	if(!obj||!type||!obj.projectId||!obj.mapLat||!obj.mapLng){
		res.json({msg:'缺少参数'})
		return;
	}
	let isobj={
		templateId:obj.templateId,
		deviceTypeId:obj.deviceTypeId
	}
	try{
		taskInfo = await addTaskInfo(obj,res)
		await Promise.all([addTaskStaff2(taskInfo.id,staffId),addTaskStaff3(taskInfo.id,staffId,'任务创建')])
		//关联任务和设备类型、模板
		let templateDevice = await addDeviceTemplate(isobj,taskInfo)
		//获取本任务对应的类型名和模板名 用于UI异步刷新
		let deviceName = await device.queryNameById(isobj.deviceTypeId)
		let templateName = await template.queryNameById(isobj.templateId)
		taskInfo['templateName'] = templateName.name
		taskInfo['deviceTypeName'] = deviceName.name
		res.json({taskInfo:taskInfo,success:true,msg:'任务信息添加成功'})

	}catch(err){
		console.log(err)
		res.json({success:false,msg:'server err',taskInfo:{}})
	}
}


async function updateInfo(req,res){
	await Promise.all([updatetask(req,res),addTaskStaff3(req.body.data.id,req.body.data.staffId,'任务更新')])
	res.json({success:true,msg:'任务信息更新成功!'})
}

function updatetask(req,res){
	return new Promise((resolve,reject)=>{
		let obj = req.body.data
		if(obj.expectTime!==''){
			obj.expectTime=parseLittleTime(obj.expectTime)
		}
		let paramsArr=[]
		//expectTime
		for(item in obj){
			if(item==='staffId'){
				continue;
			}
			let original=item
			if(item=='mapLng'){
				item='lng'
			}
			if(item=='mapLat'){
				item='lat'
			}
			paramsArr.push(item+"='"+obj[original]+"'")
		}
		let paramsStr=paramsArr.join(',')
		let sql=`update ROMS_SZ_TASK set ${paramsStr} where id = '${obj.id}'`
		pool.query(sql,(err,rows,field)=>{
			resolve()		
		})
	})
}

function singleTaskIsSend(obj,res){
	//先判断taskId是否issend
	return new Promise((resolve,reject)=>{
		let sql = 'select isSend from ROMS_SZ_TASK where id = ?'
		pool.query(sql,obj.taskId,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0].isSend)
		})
	})
}
//删除任务关联的设备、模板类型
function deleteTaskAuth(taskId){
	let sql = 'delete from ROMS_SZ_TASKAUTH where taskId = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
//删除任务关联人员
function deleteTaskStaff(taskId){
	let sql = 'delete from ROMS_SZ_TASKSTAFF where taskId = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
function deleteThatTask(taskId){
	let sql = 'delete from ROMS_SZ_TASK where id = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskId],(err,rows)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//删除平板端尚未开始的任务
async function deleteTask(id,res){
	let rows = await isTaskDone(id);
	if(rows.length==0){
		
	}else{
		if(rows[0].isDone==0){
			await deleteState(id)
			let deleteTA = await deleteTaskAuth(id)
			let deleteB = await deleteTaskStaff(id)
			let deleteTTA = await deleteThatTask(id)
			res.json({success:true,msg:'删除成功'})
		}else{
			return {msg:'该任务已同步至APP，无法删除'}
		}
	}
}