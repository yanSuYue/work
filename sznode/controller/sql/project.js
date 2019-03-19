const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime
const parseTime = require('../public/timeParse.js').parseTime
const parseTime2 = require('../public/timeParse.js').parseTime2
const parseLittleTime = require('../public/timeParse.js').parseLittleTime
const parseMoreTime = require('../public/timeParse.js').parseMoreTime
const task = require ('./task.js')
const log = require('../../server/log.js')
//计算所有项目的条数
function countProject(globalType){
	let str=``
	let subCompanyId = globalType.subCompanyId;
	let staffId = globalType.staffId
	if(subCompanyId!='undefined'){
		str=`AND staffId='${staffId}' AND subCompanyId='${subCompanyId}'`
	}
	let sql 
	if(globalType&&globalType.globalType==1){
		sql = `select count(*) as count from ROMS_SZ_PROJECT where globalType = 1 ${str}`
	}else if(globalType&&globalType.globalType==2){
		sql = `select count(*) as count from ROMS_SZ_PROJECT where globalType = 2 ${str}`
	}else{
		sql = `select count(*) as count from ROMS_SZ_PROJECT  where 1=1 ${str}`
	}
	console.log(sql)
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows[0].count)
			}else{
				resolve(0)
			}
			
		})
	})
}
//查找所有项目以及下挂的任务信息(废弃)
function queryAllProjectInfo(){
	return new Promise((resolve,reject)=>{
		pool.query('select * from ROMS_SZ_PROJECT where audit = 0',(err,rows,field)=>{
			if(err)reject(err);
			resolve(rows)
		})
	})
}

//查询项目下挂信息 (废弃)
async function queryProjectWithTask(res){
	let projectInfo = await queryAllProjectInfo()
	let projects = projectInfo.map(async (item)=>{
		let tasks = await task.queryTaskByProjectId(item.id)
		item.tasks = tasks
		//console.log(item)
		return item
	})
	Promise.all(projects).then(()=>res.json({projects:projectInfo})).catch(err=>console.log(err))
}

//countProjectg
function countProjectg(obj){
	log.info("countProjectg");
	let size = obj.pageSize
	let index = obj.pageIndex
	let subCompanyId = obj.subCompanyId
	let staffId = obj.staffId
	log.info("countProjectg size="+obj.pageSize);
	log.info("countProjectg index="+obj.pageIndex);
	log.info("countProjectg subCompanyId="+obj.subCompanyId);
	let str=``

	if(subCompanyId!='undefined'&&subCompanyId!==null){
		str=`where staffId = '${staffId}' AND subCompanyId = '${subCompanyId}'`
	}
	if(obj.keyword){
		str+=` AND pro.projectName='${obj.keyword}'`
	}
	if(obj.time.length&&obj.time[0]){
		str+=` AND pro.createtime between '${parseLittleTime(obj.time[0])}' AND '${parseMoreTime(obj.time[1])}'`
	}
	let sql = `select count(*) as count from ROMS_SZ_PROJECT pro ${str}`
	return new Promise((resolve,reject)=>{
		pool.query(sql,[],(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				console.log('********************************')
				console.log(rows[0])
				console.log('********************************')
				resolve(rows[0].count)
			}else{
				reject(null)
			}			
		})
	})
}
//分页查询一些简单的项目信息 用于列表展示
function querySimpleProjectInfo(obj){
	console.log('---------------------分页查询所有项目信息-------------------')
	let size = obj.pageSize
	let index = obj.pageIndex
	let subCompanyId = obj.subCompanyId
	let staffId = obj.staffId
	let str=``

	if(subCompanyId!='undefined'&&subCompanyId!=null){
		str=`where staffId = '${staffId}' AND subCompanyId = '${subCompanyId}'`
	}
	if(obj.keyword){
		str+=` AND pro.projectName='${obj.keyword}'`
	}
	if(obj.time.length&&obj.time[0]){
		str+=` AND pro.createtime between '${parseLittleTime(obj.time[0])}' AND '${parseMoreTime(obj.time[1])}'`
	}
	let indexEnd,indexStart;
		indexStart = size*index
		indexEnd = size
	let sql = `select pro.id,pro.createtime,pro.checkUnitName,pro.projectName,pro.globalType,pro.docDisplayUrl from ROMS_SZ_PROJECT pro ${str} order by createtime desc limit ? , ?`
	console.log(sql)
	return new Promise((resolve,reject)=>{
		pool.query(sql,[indexStart,indexEnd],(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
					item.createtime = parseTime(item.createtime)
				})
				resolve(rows)
			}else{
				console.log('ROMS_SZ_PROJECT表数据为空')
				resolve(null)
			}			
		})
	})
}

//分页查询两大类(医用、放射)的项目
function querySimpleProjectInfoByType(obj){
	//0 医用+工业 (globalType = 1 2) 1 环境+卫生 (globalType = 3 4)
	let size = obj.pageSize
	let index = obj.pageIndex
	let subCompanyId = obj.subCompanyId
	let str=``
	if(subCompanyId!='undefined'){
		str=`AND subCompanyId='${subCompanyId}'`
	}
	let indexEnd,indexStart;
		indexStart = size*index
		indexEnd = size
	let globalType = obj.globalType
	let sql = `select id,createtime,projectName,globalType,projectNum from ROMS_SZ_PROJECT  where globalType = ${globalType} ${str} order by createtime desc limit ? , ?`
	return new Promise((resolve,reject)=>{
		pool.query(sql,[indexStart,indexEnd],(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
					item.createtime = parseTime(item.createtime)
				})
				resolve(rows)
			}else{
				console.log('ROMS_SZ_PROJECT表数据为空')
				resolve(null)
			}			
		})
	})
}

function searchTasksByKey(obj){
	return new Promise((resolve,reject)=>{
		let starttime
		let endtime
		let sql
		let params
		if(obj.time&&obj.time[0]){
			starttime = parseTime(obj.time[0])
			endtime = parseTime(obj.time[1])
			sql=`select * from ROMS_SZ_TASK where checkUnitName like '%${obj.keyword}%' and createtime between '${starttime}' and '${endtime}'`
		}else{
			sql=`select * from ROMS_SZ_TASK where checkUnitName like '%${obj.keyword}%'`
		}
		pool.query(sql,(err,rows,field)=>{
			let removal= new Set()
			if(err)reject(err)
			if(rows){
				for(let item of rows){
					removal.add(item.projectId)
				}
				let projectIdArr=[]
				for(let item of removal){
					projectIdArr.push(item)
				}
				resolve({count:removal.size,projectIdArr})
			}else{
				console.log('--------------ROMS_SZ_TASK没有满足条件的数据------------')
				resolve(null)
			}			
		})
	})
}
function queryTasksByParamsId(obj){
	return new Promise((resolve,reject)=>{
		let sql
		if(obj.time&&obj.time[0]){
			starttime = parseTime(obj.time[0])
			endtime = parseTime(obj.time[1])
			sql=`select * from ROMS_SZ_TASK where projectId = '${obj.id}' and checkUnitName like '%${obj.keyword}%' and createtime between '${starttime}' and '${endtime}'`
		}else{
			sql=`select * from ROMS_SZ_TASK where projectId = '${obj.id}' and checkUnitName like '%${obj.keyword}%'`
		}
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				console.log(rows,'rows')
				resolve(rows)
			}else{
				console.log('--------------ROMS_SZ_TASK没有满足条件的数据------------')
				resolve(null)
			}			
		})
	})
}
//check页面的projects
async function showprojects(req,res){
	let pageSize = req.body.pageSize
	let nowPage = req.body.nowPage
	let start = pageSize*nowPage
	let end = pageSize
	let deviceArr = await getdeviceArr(req.body.staffId);
	if(deviceArr.length===0){
		res.json({results:[],count:0})
		return false
	}
	let [projectIds,count] = await ([getProId(req.body.subCompanyId),countPro(req.body.subCompanyId)]);
	Promise.all([projectIds,count]).then(result=>{
		let proInfo=result[0].map(async (item)=>{
			let tasks = await getTasks(item.id,req.body,deviceArr)
			item.tasks=tasks
			item.createtime=parseTime(item.createtime)
			return item
		})
		Promise.all(proInfo).then(results=>{
			res.json({results,count:result[1][0].count})
		})
	})

}

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

function getProId(subCompanyId){
	let str=``
	if(subCompanyId!='undefined'){
		str=`where PR.subCompanyId='${subCompanyId}'`
	}
	let sql = `SELECT DISTINCT projectId,PR.* FROM ROMS_SZ_TASK TA  JOIN ROMS_SZ_PROJECT PR ON PR.id=TA.projectId ${str} limit 0,10`
	return new Promise((resolve,reject)=>{
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

function getTasks(id,obj,deviceArr){
	return new Promise((resolve,reject)=>{
		let str1=``;
		let str2=``;
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
		if(obj.check===true){
			str1=`TA.insertTime`
			str2=`AND TA.isSend=1`
		}else{
			str1=`TA.pass,TA.expectTime`
		}
		let sql = `select DEVICE.name,TA.* from ROMS_SZ_TASK TA join ROMS_SZ_TASKAUTH AUTH on
		 AUTH.taskId=TA.id join ROMS_SZ_DEVICETYPE DEVICE on DEVICE.id=AUTH.deviceTypeId
		 where TA.projectId='${id}' ${str4} ${str2} ORDER BY ${str1}`
		 console.log(sql)
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				let infos=rows.map((item)=>{
					item.createtime=parseTime(item.createtime)
					return item;
				})
				resolve(infos)
			}else{
				resolve(null)
			}			
		})
	})
}

function countPro(subCompanyId){
	let str=``
	if(subCompanyId!='undefined'){
		str=`where subCompanyId='${subCompanyId}'`
	}
	let sql = `SELECT COUNT(DISTINCT projectId) as count FROM ROMS_SZ_TASK ${str}`
	return new Promise((resolve,reject)=>{
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

//分页查询一些简单的项目信息 用于列表展示
function queryParamsProjectInfo(id){
	console.log('---------------------分页查询所有项目信息-------------------')
	let sql = `select id,createtime,projectName,globalType,docDisplayUrl from ROMS_SZ_PROJECT where id = '${id}'`
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			if(rows){
				rows.forEach((item)=>{
					item.createtime = parseTime(item.createtime)
				})
				console.log('success')
				resolve(rows)
			}else{
				console.log('ROMS_SZ_PROJECT表数据为空')
				resolve(null)
			}			
		})
	})
}
//分页新函数
async function queryParamsProject(obj,res){
	let size = obj.pageSize
	let index = obj.pageIndex
	console.log(`当前查询${index+1}页`)
	let indexEnd,indexStart;
		indexStart = size*index
		indexEnd = size
	let resultCount = await searchTasksByKey(obj)
	projectIdArr=resultCount.projectIdArr
	let searchSize=projectIdArr.splice(indexStart,indexEnd);
	let projectsInfos=[];
	projectsInfos=searchSize.map(async (item)=>{
		return await queryParamsProjectInfo(item)
	})
	Promise.all(projectsInfos).then(projects=>{
		let sendInfo=projects.map(async function(item){
			obj.id=item[0].id
			let tasks= await queryTasksByParamsId(obj)
			item[0].tasks=tasks
			return item[0]
		})
		Promise.all(sendInfo).then(function(projects){
			res.json({projects,count:resultCount.count})
		})
	})
}

//查询下挂的任务信息 
async function querySimpleProject(obj,res){
	//查询总共的条数
	let count = await countProjectg(obj);
	//查询到所有项目的信息
	let projectInfo = await querySimpleProjectInfo(obj);
	if(projectInfo){
		//查询所有项目下挂的任务id
		let projects = projectInfo.map(async (item)=>{
			let tasks = await task.queryTaskIdByProjectId({id:item.id,globalType:item.globalType})
			item.tasks = tasks
			return item
		})
		
		Promise.all(projects)
		.then(()=>res.json({projects:projectInfo,count:count}))
		.catch(err=>console.log(err))		
	}else{
		res.json({projects:[],count:0})
	}
}

function getAllTasks(obj){
	return new Promise((resolve,reject)=>{
		let start=obj.nowPage*obj.pageSize
		let end = obj.pageSize
		let str=``
		let subCompanyId=obj.subCompanyId
		if(subCompanyId!='undefined'){
			str=`TASK.subCompanyId = '${subCompanyId}' AND`
		}
		let sql=`SELECT TYPE.name as deviceName,TEMPLATE.name,PROJECT.projectName ,TASK.* FROM ROMS_SZ_TASK TASK JOIN ROMS_SZ_PROJECT 
		PROJECT ON TASK.projectId=PROJECT.id JOIN ROMS_SZ_TASKAUTH AUTH ON AUTH.taskId=TASK.id JOIN ROMS_SZ_DEVICETYPE TYPE ON TYPE.id=AUTH.deviceTypeId
		JOIN ROMS_SZ_TEMPLATE TEMPLATE ON TEMPLATE.id=AUTH.templateId where ${str} TASK.isDeviate=1 order by createtime limit ${start},${end}`
		console.log(sql,'-------------------------->>>>>>>>>>>>>>')
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

function getApplys(id){
	return new Promise((resolve,reject)=>{
		let sql=`select * from ROMS_SZ_APPLY where taskId='${id}'`
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
//updateApply
function updateApply(req,res){
	let staffTime=parseTime2(req.body.staffTime)
	let sql=`update ROMS_SZ_APPLY set opinion='${req.body.opinion}',staffTime='${staffTime}',pass='${req.body.pass}' where id='${req.body.id}'`
	pool.query(sql,(err,rows,field)=>{
		if(err){
			console.log(err)
		}else{
			res.json({success:true,msg:'审核已通过！'})
		}
	})
}

function countTask(obj){
	return new Promise((resolve,reject)=>{
		let subCompanyId=obj.subCompanyId
		let str=``
		if(subCompanyId!='undefined'){
			str=`subCompanyId = '${subCompanyId}' AND`
		}
		let sql = `select count(*) as count from ROMS_SZ_TASK where ${str} isDeviate=1 `
		console.log(sql,'-------------->>>>>>>>>>>>>>>>>>')
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

async function getDeviate(obj,res){
	let count = await countTask(obj)
	let taskInfo=await getAllTasks(obj)
	let apply=taskInfo.map(async (item)=>{
		let applys = await getApplys(item.id)
		for(let i=0;i<applys.length;i++){
			applys[i].createtime=parseTime2(applys[i].createtime)
			console.log(applys[i].createtime)
		}
		item.applys = applys
		return item
	})
	Promise.all(apply).then(()=>{
		res.json({taskInfo,count})
	})
}
//报告修改里重新检测 更新任务表
function updateReportModify(req,res){
	log.info("updateReportModify");
	
		let taskId = req.body.taskId;
		let docReason = req.body.docReason;
		log.info(taskId)
		let sql = `update ROMS_SZ_TASK set  isDone = 0,  isSend = 0, pass=3, nopass=nopass+1, docReason  = '${docReason}' WHERE id = '${taskId}'`
		log.info("updateReportModify sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'已打回重检！'})
			}
		})
}

//报告修改里 重新检测 &&只修改非数据部分  更新doc表
function updateDocReportModify(req,res){
	log.info("updateDocReportModify");
	
		let taskId = req.body.taskId;
				
		log.info(taskId)
		let sql = `update ROMS_SZ_DOC set  docPassAuditor = 0,  docPassIssue = 0 WHERE taskId = '${taskId}'`
		log.info("updateDocReportModify sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'doc操作成功'})
			}
		})
}


//删除报告修改 任务表
function deleteReportModify(req,res){
	log.info("deleteReportModify");
	
	let taskId = req.body.taskId;
	log.info(taskId)
	//只保留任务创建人
	let sql = `delete from ROMS_SZ_TASKSTAFF where taskId   = '${taskId}' and type != 2 `
	log.info("deleteReportModify sql= "+ sql);
	pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'删除成功！'})
			}
		})
}



//报告修改里只修改非数据部分 更新任务表
function updateReportModifyData(req,res){
	log.info("updateReportModifyData");
	
		let taskId = req.body.taskId;
		let docReason = req.body.docReason;
		log.info(taskId)
		let sql = `update ROMS_SZ_TASK set pass = 1, isSend = 1, nopass=nopass+1, docReason  = '${docReason}' WHERE id = '${taskId}'`
		log.info("updateReportModifyData sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'已打回重审！'})
			}
		})
}


function countreport(obj){
	log.info("countreport");
	return new Promise((resolve,reject)=>{
		let str=``
		let staffId = obj.staffId
		if(obj.searchForm.docNum){
			str+=` doc.docNum='${obj.searchForm.docNum}' AND `
		}
		if(obj.searchForm.type){
			str+=` device.name='${obj.searchForm.type}' AND `
		}
		if(obj.searchForm.state!==3){
			str+= `doc.docPassAuditor='${obj.searchForm.state}' AND `
		}
		if(obj.searchForm.companyName){
			str+=` task.checkUnitName='${obj.searchForm.companyName}' AND `
		}
		if(obj.searchForm.time.length&&obj.searchForm.time[0]!==null){
			starttime = parseLittleTime(obj.searchForm.time[0])
			endtime = parseMoreTime(obj.searchForm.time[1])
			str+=` doc.auditorTime between '${starttime}' and '${endtime}' and `
		}
		let sql = `select count(*) as count from ROMS_SZ_DOC doc join ROMS_SZ_TASK task on task.id=doc.taskId join ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId where ${str} doc.staffAuditorId = '${obj.staffId}'`
		log.info("countreport sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function querynopressdoc(obj){
	log.info("querynopressdoc");
	return new Promise((resolve,reject)=>{
		let str=``
		let nowindex=obj.pageIndex
		let start=nowindex*10
		let staffId = obj.staffId?obj.staffId:'92c1821c-18e9-435c-87a4-f71c6a51ba03'
		if(obj.searchForm.docNum){
			str+=` doc.docNum='${obj.searchForm.docNum}' AND `
		}
		if(obj.searchForm.type){
			str+=` device.name='${obj.searchForm.type}' AND `
		}
		if(obj.searchForm.state!==3){
			str+=` doc.docPassAuditor='${obj.searchForm.state}' AND `
		}
		if(obj.searchForm.companyName){
			str+=` task.checkUnitName='${obj.searchForm.companyName}' AND `
		}
		if(obj.searchForm.projectNum){
			str+=` task.projectNum='${obj.searchForm.projectNum}' AND `
		}
		if(obj.searchForm.time.length&&obj.searchForm.time[0]!==null){
			starttime = parseLittleTime(obj.searchForm.time[0])
			endtime = parseMoreTime(obj.searchForm.time[1])
			str+=` doc.auditorTime between '${starttime}' and '${endtime}' and `
		}
		let sql = `select tem.num,pro.docDisplayUrl,task.measureDataPdfUrl,pro.projectName,device.id as deviceTypeId, device.name as deviceTypeName,doc.*,task.projectNum as templateNum,task.checkUnitName from ROMS_SZ_DOC doc
		join ROMS_SZ_PROJECT pro on pro.id=doc.projectId join ROMS_SZ_TASK task on task.id=doc.taskId join 
		ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId join ROMS_SZ_TEMPLATE tem on tem.id=auth.templateId where ${str} doc.staffAuditorId = '${staffId}' limit ${start},10`
		log.info("querynopressdoc sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}


function countreport2(obj){
	log.info("countreport2");
	return new Promise((resolve,reject)=>{
		let str=``
		if(obj.searchForm.docNum){
			str+=`doc.docNum='${obj.searchForm.docNum}' AND`
		}
		if(obj.searchForm.type){
			str+=`device.name='${obj.searchForm.type}' AND`
		}
		if(obj.searchForm.state!==3){
			str+=`doc.docPassIssue='${obj.searchForm.state}' AND`
		}
		if(obj.searchForm.companyName){
			str+=`task.checkUnitName='${obj.searchForm.companyName}' AND`
		}
		
		if(obj.searchForm.time.length&&obj.searchForm.time[0]!==null){
			starttime = parseLittleTime(obj.searchForm.time[0])
			endtime = parseMoreTime(obj.searchForm.time[1])
			str+=` doc.issueTime between '${starttime}' and '${endtime}' and `
		}
		let sql = `select count(*) as count from ROMS_SZ_DOC doc join ROMS_SZ_TASK task on task.id=doc.taskId join ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId  where ${str} doc.staffIssueId = '${obj.staffId}' `
		log.info("countreport2 sql"+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}



function countreport3(obj){
	log.info("countreport3");
	return new Promise((resolve,reject)=>{
		let str=``
		if(obj.searchForm.docNum){
			str+=`doc.docNum='${obj.searchForm.docNum}' AND`
		}
		if(obj.searchForm.type){
			str+=`device.name='${obj.searchForm.type}' AND`
		}
		
		
		
		if(obj.searchForm.companyName){
			str+=`task.checkUnitName='${obj.searchForm.companyName}' AND`
		}
		str+=`  STAFF.staffId IS NOT NULL AND task.pass!=1 AND  (doc.docPassIssue=1 OR doc.docPassAuditor = 1) `
		let sql = `select count(DISTINCT STAFF.taskId) as count from ROMS_SZ_DOC doc join ROMS_SZ_TASK task on task.id=doc.taskId join ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId JOIN ROMS_SZ_TASKSTAFF STAFF ON STAFF.taskId=task.id JOIN ROMS_SZ_PROJECT project ON task.projectid = project.id   where ${str}  `
		log.info("countreport3 sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function querynopressdoc2(obj){
	return new Promise((resolve,reject)=>{
		let nowindex=obj.pageIndex
		let start=nowindex*10
		let staffId=obj.staffId;
		let str=``
		if(obj.searchForm.docNum){
			str+=`doc.docNum='${obj.searchForm.docNum}' AND`
		}
		if(obj.searchForm.type){
			str+=`device.name='${obj.searchForm.type}' AND`
		}
		if(obj.searchForm.state!==3){
			str+=`doc.docPassIssue='${obj.searchForm.state}' AND`
		}
		if(obj.searchForm.companyName){
			str+=`task.checkUnitName='${obj.searchForm.companyName}' AND`
		}
		if(obj.searchForm.time.length&&obj.searchForm.time[0]!==null){
			starttime = parseLittleTime(obj.searchForm.time[0])
			endtime = parseMoreTime(obj.searchForm.time[1])
			str+=` doc.issueTime between '${starttime}' and '${endtime}' and `
		}
		let sql = `select docDisplayUrl,task.measureDataPdfUrl,device.id as deviceTypeId, device.name as deviceTypeName,doc.*,task.checkUnitName from ROMS_SZ_DOC doc join ROMS_SZ_TASK task on task.id=doc.taskId join ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId JOIN ROMS_SZ_PROJECT project ON task.projectid = project.id where ${str} doc.staffIssueId = '${staffId}' AND doc.docPassAuditor=2 limit ${start},10`
		log.info("querynopressdoc2:sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//报告修改
function querynopressdoc3(obj){
	return new Promise((resolve,reject)=>{
		let nowindex=obj.pageIndex
		let start=nowindex*10
		let staffId=obj.staffId
		let str=``
		if(obj.searchForm.docNum){
			str+=`doc.docNum='${obj.searchForm.docNum}' AND`
		}
		if(obj.searchForm.type){
			str+=`device.name='${obj.searchForm.type}' AND`
		}
		
		
		
		if(obj.searchForm.companyName){
			str+=`task.checkUnitName='${obj.searchForm.companyName}' AND`
		}
		
		str+=` (doc.docPassIssue=1 or doc.docPassAuditor = 1) `
		
		let sql = `select  DISTINCT docDisplayUrl,task.measureDataPdfUrl,device.id as deviceTypeId, device.name as deviceTypeName,doc.*,task.checkUnitName from ROMS_SZ_DOC doc join ROMS_SZ_TASK task on task.id=doc.taskId join ROMS_SZ_TASKAUTH auth on auth.taskId=task.id join ROMS_SZ_DEVICETYPE device
		on device.id=auth.deviceTypeId  JOIN ROMS_SZ_TASKSTAFF STAFF ON STAFF.taskId=task.id   JOIN ROMS_SZ_PROJECT project ON task.projectid = project.id where STAFF.staffId IS NOT NULL AND task.pass!=1 AND ${str}  limit ${start},10`
		log.info("querynopressdoc3:sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//报告审核
async function querySimpleProjectPassed(obj,res){
	let count = await countreport(obj);
	let projectInfo = await querynopressdoc(obj)
	res.json({count,projectInfo})	
}


//报告签发
async function querySimpleProjectPassed2(obj,res){
	let count = await countreport2(obj);
	let projectInfo = await querynopressdoc2(obj)
	res.json({count,projectInfo})	
}


//报告修改
async function querySimpleProjectPassed3(obj,res){
	let count = await countreport3(obj);
	let projectInfo = await querynopressdoc3(obj)
	res.json({count,projectInfo})	
}

//下挂所用任务均已通过 可整个生成报告的项目
function projectPassed(obj,res){
	console.log('----------------------查询Audit=1的项目-----------------------')
	let size = obj.pageSize
	let index = obj.pageIndex
	console.log(`当前查询${index+1}页`)
	let indexEnd,indexStart;
		indexStart = size*index
		indexEnd = size
	let sql = 'select id,createtime,projectName,globalType from ROMS_SZ_PROJECT  where globalType = 2 and audit = 1  order by createtime desc limit ? , ?'
	console.log('indexStart',indexStart,'indexEnd',indexEnd)
	console.log('---------------------分页查询分类项目信息-------------------')
	_pass = new Promise((resolve,reject)=>{
		pool.query(sql,[indexStart,indexEnd],(err,rows,field)=>{
			if(err)reject(err)
			rows.forEach((item)=>{
				item.createtime = parseTime(item.createtime)
			})
			resolve(rows)
		})
	})
	_pass.then((rows)=>{
		res.json({success:true,projects:rows})
	})
	.catch(err=>{
		console.log('-----------------查询已通过的项目失败--------------')
		res.json({success:false,projects:[]})
	})
}

//已生成可供下载报告的任务
async function querySimpleProjectHasDoc(obj,res){
	console.log('-------------------查询放射卫生下的已生成报告的任务---------------')
	let count = await countProject(obj)
	//查询到所有项目的信息
	let projectInfo = await querySimpleProjectInfoByType(obj)
	if(projectInfo){
		//查询所有项目下挂的已生成报告的任务id
		let projects = projectInfo.map(async (item)=>{
			let tasks = await task.queryTaskHasDoc(item.id)
			item.tasks = tasks
			//console.log(item)
			return item
		})
		//Promise.all(projects).then(item=>console.log('====',item)).catch(err=>console.log(err))
		Promise.all(projects)
		.then(()=>res.json({projects:projectInfo,count:count}))
		.catch(err=>console.log(err))
	}else{
		res.json({projects:[],count:0})
	}	
}

//一份项目一份报告的
async function querySingleProjectHasDoc(obj,res){
	let count = await countProject(obj.globalType)
	let size = obj.pageSize
	let index = obj.pageIndex
	console.log(`当前查询${index+1}页`)
	let indexEnd,indexStart;
		indexStart = size*index
		indexEnd = size
	let sql = 'select id,createtime,projectName,docUrl,dataZip,projectZip from ROMS_SZ_PROJECT  where globalType = 2 and audit = 1  order by createtime desc limit ? , ?'
	
	pool.query(sql,[indexStart,indexEnd],(err,rows,field)=>{
		if(err){
			res.json({err:'查询错误'})
		}
		rows.forEach((item)=>{
			item.createtime = parseTime(item.createtime)
		})
		res.json({projects:rows,count:count})
	})

}

//通过id查询某个项目信息
function queryProjectById(id){
	return new Promise((resolve,reject)=>{

		pool.query('select * from ROMS_SZ_PROJECT where id = ?',[id],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//通过id查询项目+任务
function querySingleProject(id){
	let single =  queryProjectById(id)
	let singleWithTask = task.queryTaskByProjectId(id)
	Promise.all([single,singleWithTask])
	.then(([single,singleWithTask])=>{
		single.tasks=singleWithTask
		console.log(single)
	})
	.catch(err=>console.log(err))
}


//判断项目是否重复
function uniqueProject(obj){
	let sql = 'select projectName from ROMS_SZ_PROJECT where projectName = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[obj.projectName],(err,rows,field)=>{
			if(err)reject(err)
			if(rows.length>0){
				resolve({msg:'项目名不能重复',code:1})
			}else{
				resolve({msg:'项目没有重复',code:0})
			}
		})
	})
}

function getStr2(i){
	let sql = `select max(projectNum) as num from ROMS_SZ_PROJECT`
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

//添加一个项目
async function addProject(obj,res){
	let foo=await getStr2()
	let projectNum=foo[0].num+1
	let str2='RD0117'
	if(projectNum<10){
		str2+='000'+projectNum
	}else if(projectNum<100){
		str2+='00'+projectNum
	}else if(projectNum<1000){
		str2+='0'+projectNum
	}else{
		str2+=projectNum  
	}
	
	
	
	let sql = 'insert into ROMS_SZ_PROJECT (id,createtime,checkUnitName,projectName,globalType,docDisplayUrl,subCompanyId,staffId,projectNum) values (?,?,?,?,?,?,?,?,?)'
	let createtime = makeDateTime().time
	let id = uuid()
	let unique = await uniqueProject(obj) 
	if(unique.code==1){
		console.log('------------------项目名重复----------------')
		res.json({msg:'项目名重复'})
		return
	}
	let globalType = obj.globalType
	let subCompanyId = obj.subCompanyId
	let checkUnitName = obj.projectName
	let projectName = obj.projectName+str2
	let staffId = obj.staffId
	let docDisplayUrl = obj.docDisplayUrl || ''
	let add_project = new Promise((resolve,reject)=>{
		pool.query(sql,[id,createtime,checkUnitName,projectName,obj.globalType,docDisplayUrl,subCompanyId,staffId,projectNum],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
	add_project.then((rows)=>{
		console.log('--------------项目添加成功--------------')
		res.json({msg:'项目添加成功',id:id,createtime:createtime,success:true,docDisplayUrl:docDisplayUrl,globalType:globalType,msg:'添加成功'})
	})
	.catch(err=>{
		console.log('--------------项目添加失败--------------')
		console.log(err)
		res.json({success:false,msg:'添加失败'})
	})
}

function hasProject(id){
	let sql = 'select * from ROMS_SZ_PROJECT where id = ? '
	return new Promise((resolve,reject)=>{
		pool.query(sql,[id],(err,rows,field)=>{
			if(err)reject(err)
			if(rows.length>0){
				resolve({msg:'存在此项目',code:1})
			}else{
				resolve({msg:'不存在此项目',code:0})
			}
		})
	})
}
async function deleteProject(id,res){
	let sql = 'delete from ROMS_SZ_PROJECT where id = ?'
	let delete_project = new Promise((resolve,reject)=>{
		pool.query(sql,[id],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
	delete_project
	.then(()=>{
		console.log('---------------删除项目成功---------------')
		res.json({msg:'删除成功',success:true})
	})
	.catch(err=>{
		console.log('---------------删除项目失败---------------')
		res.json({msg:'删除失败',success:false})
		console.log(err)
	})
}	

const project = {}
module.exports = project
project.queryProjectWithTask = queryProjectWithTask
project.deleteProject = deleteProject
project.showprojects = showprojects
project.queryAllProjectInfo = queryAllProjectInfo
project.querySimpleProject = querySimpleProject
project.queryParamsProject = queryParamsProject
project.querySingleProject = querySingleProject
project.querySimpleProjectPassed = querySimpleProjectPassed
project.querySimpleProjectPassed2 = querySimpleProjectPassed2
project.querySimpleProjectPassed3 = querySimpleProjectPassed3
project.querySimpleProjectHasDoc = querySimpleProjectHasDoc
project.addProject = addProject 
project.querySingleProjectHasDoc = querySingleProjectHasDoc
project.projectPassed = projectPassed
project.getDeviate = getDeviate
project.updateApply = updateApply


project.updateReportModify = updateReportModify
project.updateReportModifyData = updateReportModifyData
project.updateDocReportModify = updateDocReportModify
project.deleteReportModify = deleteReportModify


