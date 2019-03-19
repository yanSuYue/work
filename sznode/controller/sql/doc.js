const request = require('request')

const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime
const parseTime = require('../public/timeParse.js').parseTime
const parseLittleTime = require('../public/timeParse.js').parseLittleTime
const log = require('../../server/log.js')



//报告归档里重新检测 更新任务表
function updateTaskReportSummary(req,res){
	log.info("updateReportModify");
	
		let taskId = req.body.taskId;
		let fileReason = req.body.fileReason;
		
		log.info(taskId)
		let sql = `update ROMS_SZ_TASK set  isDone = 0,  isSend = 0, pass=3, nopass=nopass+1, docReason  = '${fileReason}'  WHERE id = '${taskId}'`
		log.info("updateTaskReportSummary sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'已打回重检！'})
			}
		})
}

//报告归档里 重新检测 &&只修改非数据部分  更新doc表
function updateDocReportSummary(req,res){
	log.info("updateDocReportSummary");
	
		let taskId = req.body.taskId;
		//let fileReason = req.body.fileReason;
				
		log.info(taskId)
		let sql = `update ROMS_SZ_DOC set  docPassAuditor = 0,  docPassIssue = 0 , isG=isG+1 WHERE taskId = '${taskId}'`
		log.info("updateDocReportSummary sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'doc操作成功'})
			}
		})
}


//删除报告归档任务表
function deleteReportSummary(req,res){
	log.info("deleteReportSummary");
	
	let taskId = req.body.taskId;
	log.info(taskId)
	let sql = `delete from ROMS_SZ_TASKSTAFF where taskId   = '${taskId}' AND type !=2 `
	log.info("deleteReportSummary sql= "+ sql);
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
function updateReportSummaryData(req,res){
	log.info("updateReportSummaryData");
	
		let taskId = req.body.taskId;
		let fileReason = req.body.fileReason;
		log.info(taskId)
		let sql = `update ROMS_SZ_TASK set pass = 1, isSend = 1, nopass=nopass+1, docReason  = '${fileReason}' WHERE id = '${taskId}'`
		log.info("updateReportSummaryData sql="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err){
				console.log(err)
				log.info(err)
			}else{
				res.json({success:true,msg:'已打回重审！'})
			}
		})
}



 


function getDocCount(req){
	log.info("getDocCount")
	return new Promise((resolve,reject)=>{
		let checkUnitName = req.body.searchForm.companyName
		let docNum = req.body.searchForm.docNum
		let str = ``
		if(checkUnitName.length){
			str+=`TASK.checkUnitName='${checkUnitName}' AND `
		}
		if(docNum.length){
			str+=`TASK.docNum='${docNum}' AND `
		}
		let sql=`SELECT count(*) as count FROM ROMS_SZ_DOC DOC 
		
				JOIN ROMS_SZ_TASK TASK ON DOC.taskId=TASK.id JOIN ROMS_SZ_TASKSTAFF STAFFTASK ON TASK.id=STAFFTASK.taskId
				
				JOIN ROMS_SZ_STAFF STAFFNAME ON STAFFNAME.id=STAFFTASK.staffId JOIN ROMS_SZ_PROJECT PRO ON PRO.id=DOC.projectId
				
				JOIN ROMS_SZ_TASKAUTH TASKAUTH ON TASKAUTH.taskId=DOC.taskId JOIN ROMS_SZ_TEMPLATE TEMPLATE ON TEMPLATE.id=TASKAUTH.templateId
				
				WHERE ${str} DOC.issueTime is not NULL AND STAFFTASK.type=2`
		log.info("getDocCount sql="+sql)
		pool.query(sql,(err,rows,field)=>{
			if(err){
				reject(err)
			}else{
				resolve(rows)
			}
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

function getDoc(req){
	return new Promise((resolve,reject)=>{
		let pageSize = req.body.pageSize
		let nowPage = req.body.pageIndex
		let start = pageSize*nowPage;
		let end = 10;
		let checkUnitName = req.body.searchForm.companyName
		let docNum = req.body.searchForm.docNum
		let str = ``
		if(checkUnitName.length){
			str+=`TASK.checkUnitName='${checkUnitName}' AND `
		}
		
		if(docNum.length){
			str+=`TASK.docNum='${docNum}' AND `
		}
		let sql=`SELECT TASK.createtime as taskTime,PRO.docDisplayUrl,TEMPLATE.num, PRO.projectName,TASK.measureDataPdfUrl,TASK.projectNum AS taskProNum, STAFFNAME.staffName AS contactName,TASK.docReason, TASK.checkUnitContact,TASK.checkUnitName,DOC.* FROM ROMS_SZ_DOC DOC 
		
				JOIN ROMS_SZ_TASK TASK ON DOC.taskId=TASK.id JOIN ROMS_SZ_TASKSTAFF STAFFTASK ON TASK.id=STAFFTASK.taskId
				
				JOIN ROMS_SZ_STAFF STAFFNAME ON STAFFNAME.id=STAFFTASK.staffId JOIN ROMS_SZ_PROJECT PRO ON PRO.id=DOC.projectId
				
				JOIN ROMS_SZ_TASKAUTH TASKAUTH ON TASKAUTH.taskId=DOC.taskId JOIN ROMS_SZ_TEMPLATE TEMPLATE ON TEMPLATE.id=TASKAUTH.templateId
				
				WHERE ${str} DOC.issueTime is not NULL AND STAFFTASK.type=2 limit ${start},${end} `
		
		log.info(" getDoc sql="+sql)
			
		pool.query(sql,(err,rows,field)=>{
			if(err){
				reject(err)
			}else{
				resolve(rows)
			}
		})
	})
}
async function getDocInfo(req,res){
	let [count,info] = await Promise.all([getDocCount(req),getDoc(req)])
	let infos=info.map((item)=>{
		item.auditorTime=parseTime(item.auditorTime)
		item.issueTime=parseTime(item.issueTime)
		return item
	})
	res.json({infos,count:count[0].count})
}
function updateSize(obj,res){
	let sql=`update ROMS_SZ_DOC set size='${Number(obj.size)}' where id='${obj.id}' `
	pool.query(sql,(err,rows,field)=>{
		if(err){

		}else{
			res.json({success:true,message:'更新成功！'})
		}
	})
}
function public (obj){
	return new Promise((resolve,reject)=>{
		let id = uuid()
		let sql=`insert into  ROMS_SZ_DOC (staffAuditorId,projectId,staffMakeId,id,docNum,taskId) values('${obj.staffAuditorId}','${obj.projectId}','${obj.staffId}','${id}','${obj.docNum}','${obj.taskId}')`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
function public1 (obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_DOC set staffAuditorId='${obj.staffAuditorId}',projectId='${obj.projectId}',staffMakeId='${obj.staffId}',docNum='${obj.docNum}' where taskId='${obj.taskId}'`
		console.log("更新doc="+sql);
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
function public2 (obj){
	return new Promise((resolve,reject)=>{
		let auditorTime = makeDateTime().time
		let sql=`update ROMS_SZ_DOC set staffIssueId='${obj.staffIssueId}', auditorTime='${auditorTime}' where taskId='${obj.taskId}' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
function public3 (obj){
	return new Promise((resolve,reject)=>{
		let issueTime = parseLittleTime(obj.qianfatime)
		let sql=`update ROMS_SZ_DOC set  issueTime='${issueTime}' where taskId='${obj.taskId}' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}

function public4(obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_DOC set docPassAuditor=2 where taskId='${obj.taskId}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
function public5 (obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_DOC set  docPassIssue=2 where taskId='${obj.taskId}' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}


function updateprintsize (obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_DOC set size='${obj.size}' where id='${obj.id}' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}
async function nopassSure(obj,res){
	//await updatetask(obj)
	await updatedoc(obj)
}

function updatetask (obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_TASK set pass=1 where id='${obj.taskId}' `
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve()
		})
	})
}

function updatedoc(obj){
	return new Promise((resolve,reject)=>{
		let auditorTime = makeDateTime().time
		let sql=`update ROMS_SZ_DOC set docPassAuditor=1,reason='${obj.reason}',auditorTime='${auditorTime}' where id='${obj.id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function updatedoc2(obj){
	return new Promise((resolve,reject)=>{
		let issueTime = makeDateTime().time
		//issueReason='${obj.nopassReason}',
		let sql=`update ROMS_SZ_DOC set docPassIssue=1,issueReason='${obj.nopassReason}', issueTime='${issueTime}' where id='${obj.id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
function updatedoc3(obj){
	return new Promise((resolve,reject)=>{
		let sql=`update ROMS_SZ_DOC set docPassAuditor=0 where id='${obj.id}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}
async function nopassSure2(obj,res){
	//await updatetask(obj)
	await updatedoc2(obj)
	await updatedoc3(obj)
}

function isExist(obj){
	return new Promise((resolve,reject)=>{
		let issueTime = makeDateTime().time
		let sql=`select * from ROMS_SZ_DOC where taskId='${obj.taskId}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}


function delreport(obj){
	return new Promise((resolve,reject)=>{
		let sql=`update  ROMS_SZ_DOC set docPassAuditor=0 where taskId='${obj.taskId}'`
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function passTaskUpdate(taskId){
	return new Promise((resolve,reject)=>{
		let sql = `update ROMS_SZ_TASK set pass = 2 where id = '${taskId}'`
		pool.query(sql,[],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

async function makeDoc(obj,res) {
	let docNum = obj.docNum
	let docTime = makeDateTime().time
	let taskId = obj.taskId
	
	console.log("flsg="+obj.flag);
	if(obj.flag==1){
		let val = await isExist(obj)
		console.log("val="+val.length);
		if(val.length>0&&obj.flag==1){
			//报告查询长度大于0，就去更新
			await Promise.all([addTaskStaff3(taskId,obj.staffId,'生成报告'),public1(obj)])
		}else{
			//报告查询长度==0，就去插入
			await Promise.all([addTaskStaff3(taskId,obj.staffId,'生成报告'),public(obj)])
		}
		await Promise.all([addTaskStaff3(taskId,obj.staffId,'原始记录表审核通过')])
		
	}
	if(obj.flag==2){
		await Promise.all([addTaskStaff3(taskId,obj.staffId,'报告审核'),public2(obj)])
	}
	if(obj.flag==3){
		await Promise.all([addTaskStaff3(taskId,obj.staffId,'报告签发'),public3(obj)])
	}
	let json = JSON.stringify({
		taskId:taskId,
		docNum:docNum,
		docTime:docTime
	})
	let datax = "["+json+"]"
	request.post({
	url:'http://120.77.153.63:8080/roms/Json/ROMS_SZ_TASKAction!report_Generate',
	headers:{
		'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
		'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
		'Accept-Encoding':'gzip, deflate, br',
		'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6'
	},
		form:{data:datax},
	})
	.on('data',(data)=>{

		let javaRes = data.toString()
		let jsonRes = eval('('+javaRes+')')
		if(jsonRes.success){
			if(obj.flag==2){
				public4(obj).then(e=>{
					res.json(jsonRes)
				})
			}else if(obj.flag==3){
				public5(obj).then(e=>{
					res.json(jsonRes)
				})
			}else if(obj.flag==1){
				passTaskUpdate(taskId).then(e=>{
					res.json(jsonRes)
				})
			}else{
			  res.json(jsonRes)
			}
		}else{
			res.json(jsonRes)
		}
		
	})
}

let globalDoc = {}
globalDoc.updateSize=updateSize
globalDoc.getDocInfo=getDocInfo
globalDoc.makeDoc = makeDoc
globalDoc.nopassSure = nopassSure
globalDoc.nopassSure2 = nopassSure2
globalDoc.updateprintsize = updateprintsize

globalDoc.updateTaskReportSummary = updateTaskReportSummary
globalDoc.updateDocReportSummary =  updateDocReportSummary

globalDoc.deleteReportSummary = deleteReportSummary

globalDoc.updateReportSummaryData = updateReportSummaryData
module.exports = globalDoc