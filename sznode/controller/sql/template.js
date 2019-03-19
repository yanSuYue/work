const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime


const template = {}
module.exports = template

template.delStandard = delStandard
template.queryAllTemplateByDevice = queryAllTemplateByDevice 
template.addStandard = addStandard
template.updateStandard = updateStandard
template.queryTemplateName = queryTemplateName
template.queryNameById = queryNameById
template.gettemplate = gettemplate
template.queryTemplateByTask = queryTemplateByTask
template.queryTemplateInfoByTask =queryTemplateInfoByTask
function queryAllTemplateByDevice(deviceTypeId){
	let sql = 'select * from ROMS_SZ_TEMPLATETYPE where deviceTypeId = ? '
	return new Promise((resolve,reject)=>{
		pool.query(sql,[deviceTypeId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function gettemplates(req){
	return new Promise((resolve,reject)=>{
		let pageSize = req.body.pageSize
		let nowPage = req.body.nowPage
		let start = pageSize*nowPage;
		let obj=req.body.search
		let str=`where 1=1`
		if(obj.name){
			str+=` AND DETYPE.name = '${obj.name}'`
		}
		if(obj.type){
			str+=` AND MAIN.name = '${obj.type}'`
		}
		let end = 10
		let sql=`SELECT
		MAIN.name AS mainName,
		DETYPE.name AS typeName,
		TEM.name as temName,
		TEM.num as num,
		TYPE.standard,
		TYPE.id as temid,
		TEM.*
		FROM ROMS_SZ_TEMPLATETYPE TYPE
		JOIN ROMS_SZ_TEMPLATE TEM
		ON TYPE.templateId = TEM.id
		JOIN ROMS_SZ_DEVICETYPE DETYPE
		ON DETYPE.id = TYPE.deviceTypeId
		JOIN ROMS_SZ_DEVICEMAIN MAIN ON MAIN.id=DETYPE.deviceMainId ${str} order by TEM.num limit ${start},${end}`
		pool.query(sql,(err,rows)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

function getstand(id){
	return new Promise((resolve,reject)=>{
		let sql=`select standard from ROMS_SZ_TEMPLATETYPE where id='${id}'`
		pool.query(sql,(err,rows)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

async function delStandard(req,res){
	let info=await getstand(req.body.id)
	await delStandard2(info,req,res)
}

function delStandard2(info,req,res){
	return new Promise((resolve,reject)=>{
		let sql;
		let val=info[0].standard;
		let arr2=[];
		console.log(val,'ttttttttttttttttttttttttt')
		if(val.match('|')){
			let arr=val.split('|');
			console.log(arr,'8888888888')
			for(let i=0;i<arr.length;i++){
				if(arr[i]!==req.body.nownote){
					
					arr2.push(arr[i])
				}
			}
			sql=`update ROMS_SZ_TEMPLATETYPE set standard='${arr2.join("|")}' where id='${req.body.id}'`
		}else{
			sql=`update ROMS_SZ_TEMPLATETYPE set standard='' where id='${req.body.id}'`
		}
		pool.query(sql,(err,rows)=>{
			if(err){
				reject(err)
				res.json(err)
			}else{
				resolve(rows)
				res.json({success:true,msg:'删除成功！'})
			}
			
		})
	})
}

async function updateStandard(req,res){
	let info=await getstand(req.body.id)
	
	let val=info[0].standard

	await updateStandard2(req,val,res)
}

function updateStandard2(req,val,res){
	return new Promise((resolve,reject)=>{
		let sql;
		let str=val.replace(req.body.nownote,req.body.content)
		
		sql=`update ROMS_SZ_TEMPLATETYPE set standard='${str}' where id='${req.body.id}'`
		console.log(sql,'9999999999999999999999999999999')
		pool.query(sql,(err,rows)=>{
			if(err){
				reject(err)
				res.json(err)
			}else{
				resolve(rows)
				res.json({success:true,msg:'更新成功！'})
			}
			
		})
	})
}

function newstandard(req,val,res){
	return new Promise((resolve,reject)=>{
		let sql,str
		if(val.length){
			str=val+'|'+req.body.content
		}else{
			str=req.body.content
		}
		sql=`update ROMS_SZ_TEMPLATETYPE set standard='${str}' where id='${req.body.id}'`
		pool.query(sql,(err,rows)=>{
			if(err){
				reject(err)
				res.json(err)
			}else{
				resolve(rows)
				res.json({success:true,msg:'增加成功！'})
			}
			
		})
	})
}

async function addStandard(req,res){
	let info=await getstand(req.body.id)
	let val=info[0].standard
	await newstandard(req,val,res)
}

function gettemplatescount(req){
	return new Promise((resolve,reject)=>{
		let obj=req.body.search
		let str=`where 1=1`
		if(obj.name){
			str+=` AND DETYPE.name = '${obj.name}'`
		}
		if(obj.type){
			str+=` AND MAIN.name = '${obj.type}'`
		}
		let sql=`SELECT
		count(*) as count
		FROM ROMS_SZ_TEMPLATETYPE TYPE
		JOIN ROMS_SZ_TEMPLATE TEM
		ON TYPE.templateId = TEM.id
		JOIN ROMS_SZ_DEVICETYPE DETYPE
		ON DETYPE.id = TYPE.deviceTypeId
		JOIN ROMS_SZ_DEVICEMAIN MAIN ON MAIN.id=DETYPE.deviceMainId ${str}`
		pool.query(sql,(err,rows)=>{
			if(err)reject(err)
			resolve(rows)
		})
	})
}

async function gettemplate(req,res){
	let [info,count]=await Promise.all([gettemplates(req),gettemplatescount(req)])
	Promise.all([count,info]).then(e=>{
		res.json({count,info})
	}).catch(e=>{
		res.json(e)
	})
}

async function queryTemplateName(deviceid,res){
	console.log('--------------设备类型下的模板-----------')
	let templateId = await queryAllTemplateByDevice(deviceid)
	let sql = 'select id,name,num from ROMS_SZ_TEMPLATE where id = ?'
	let names = templateId.map((item)=>{
		//console.log(item)
		return new Promise((resolve,reject)=>{
			pool.query(sql,[item.templateId],(err,rows,field)=>{
				if(err)throw(err)
				rows[0].standard=item.standard
				resolve(rows[0])
			})
		})		
	})
	Promise.all(names)
	.then((rows)=>res.json({templates:rows}))
	.catch(err=>console.log(err))
}

function queryTemplateByTask(taskid){
	let sql = 'select templateId from ROMS_SZ_TASKAUTH where taskId = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[taskid],(err,rows)=>{
			if(err)reject(err)
			if(rows){
				resolve(rows[0])
			}else{
				resolve(null)
			}
			
		})
	})
}
function queryNameById(templateId){
	let sql = 'select * from ROMS_SZ_TEMPLATE where id = ?'
	return new Promise((resolve,reject)=>{
		pool.query(sql,[templateId],(err,rows,field)=>{
			if(err)reject(err)
			resolve(rows[0])
		})
	})
}

async function queryTemplateInfoByTask(taskid){
	try{
		console.log('----------------查找任务下关联的模板 taskid--------------',taskid)
		let templateTypeInfo = await queryTemplateByTask(taskid)
		let templateTypeName
		let templateId
		let templateNum
		let templateTypeNum

		if(templateTypeInfo){
			templateId = templateTypeInfo.templateId
			templateType = await queryNameById(templateTypeInfo.templateId)
			templateTypeName = templateType.name
			templateTypeNum = templateType.num
		}else{
			templateId = ''
			templateTypeName = ''
		}

		
		let obj={
			templateId:templateId,
			templateName:templateTypeName,
			templateNum:templateTypeNum
		}
		return obj
	}catch(err){
		console.log(err)
		throw err
	}
}