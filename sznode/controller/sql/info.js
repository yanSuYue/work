const obj = require('../connect/sql-option.js')
const uuid = require('uuid/v4')
const pool = require('../connect/mysql.js').pool(obj)
const makeDateTime = require('../public/timeParse.js').makeDateTime
const parseTime = require('../public/timeParse.js').parseTime


const info = {}


function addTaskInfo(obj,res){
	if(!obj.projectId||obj.projectId==''){
		res.json({success:false,msg:'projectId不能为空'})
		return;
	}
	let createtime = makeDateTime().time
	let id = uuid()
	let str=`createtime,id`
	let values=`'${createtime}','${id}'`
	obj.templateId=''
	obj.globalType=''
	obj.lng=obj.mapLng
	obj.lat=obj.mapLat
	obj.mapLng=''
	obj.mapLat=''
	obj.deviceTypeId=''
	for(let item in obj){
		if(obj[item]){
			str+=`,${item}`
			values+=`,'${obj[item]}'`
		}
	}
	let sql=`insert into ROMS_SZ_TASK (${str}) values(${values}) `
	console.log(sql)
	return new Promise((resolve,reject)=>{
		pool.query(sql,(err,rows,field)=>{
			if(err)reject(err)
			resolve({id:id,createtime:createtime})
		})
	})
}


module.exports = info

info.addTaskInfo = addTaskInfo

