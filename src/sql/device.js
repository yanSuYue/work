const db = require('./connect.js')
const getAllTime = require('../config/public.js').getAllTime
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const qs = require('querystring');
const http = require('http'); 

async function get_device(req,res){
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd = pageSize
	}

	let back
	let count
	let monstationId = req.session.stationId
	let admin = req.session.admin
	if(true){
		let _sql = `select INS.*,PCE.provinceName,CI.cityName,MON.monstationName from ROMS202_INSTRUMENT INS join ROMS202_MONSTATION MON on
		MON.id=INS.monstationId join ROMS202_DISTRICT DIS on DIS.id=MON.districtId join ROMS202_CITY CI on CI.id=DIS.cityId join
		ROMS202_PROVINCE PCE on PCE.id=CI.provinceId
		order by createtime desc limit ?,?`
		let _params = [pageStart,pageEnd]
		back = await db.raw_select(_sql,_params)
		_count_obj = await db.countTable('ROMS202_INSTRUMENT')
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}

	}
	if(back.success){
		let list = back.result.map(r=>{
			r['createtime']=timing.format(r.createtime)
			r['starttime']=timing.format(r.starttime)
			r['endtime']=timing.format(r.endtime)
			return r
		})
		Promise.all(list)
		.then(r=>{
			res.json({devices:r,count:count})
		})
		.catch(e=>console.log(e))
	}else{
		res.json({devices:back.result,count:count})
	}

}

//get_device()
async function add_device(req,res){
	let _params
	let id = uuid()
	let createtime = timing.now()
	let params = req.body

	let deviceModel = params.deviceModel
	let factor = params.factor

	let subType = params.subType[0]
	let subSubType = params.subType[1]?params.subType[1]:0
	let starttime =getAllTime(params.time[0])
	let endtime = getAllTime(params.time[1])
	//-----------------------修改时间--------------
	//let endtime = getAllTime(params.time[1]).substring(0,getAllTime(params.time[1]).length(-9))
	//let monstationId = req.session.stationId?req.session.stationId:req.session.admin
	let monstationId
	params.station?monstationId=params.station:monstationId=req.session.stationId
	let correctNum = params.correctNum
	let deviceNum = params.deviceNum
	let deviceUnit = params.deviceUnit
	let deviceName = params.deviceName
	let correctUrl = params.correctUrl
	let note = ''
	let _key = ['id','deviceNum','createtime','deviceName','deviceModel','factor','subType','starttime','endtime','monstationId','correctNum','deviceUnit','note','correctUrl','subSubType']
	let _val = [id,deviceNum,createtime,deviceName,deviceModel,factor,subType,starttime,endtime,monstationId,correctNum,deviceUnit,'监测站',correctUrl,subSubType]
	_params = ['ROMS202_INSTRUMENT',_key,_val]

	let back = await db.raw_insert(_params)
	console.log(back)
	back.affected?res.json({success:true,msg:'添加成功',id:id,createtime:createtime}):res.json({success:false,msg:'添加失败'})
}
//add_device(1)

async function delete_device(req,res){
	let params = req.body
	let _params = ['ROMS202_INSTRUMENT',{id:params.delete_id}]
	let back = await db.delete(_params)
	console.log(back)
	back.affected?res.json({success:true,msg:'删除成功'}):res.json({success:false,msg:'删除失败'})
}
//delete_device()
async function update_device(req,res){
	console.log(123)
	let params = req.body
	let starttime =getAllTime(params.time[0])
	let endtime = getAllTime(params.time[1])
	let _key = ['id','deviceModel','factor','subType','starttime','endtime','monstationId','note','subSubType']
	let _change = {
		deviceName:params.deviceName,
		deviceModel:params.deviceModel,
		factor:params.factor,
		subType:params.subType[0],
		starttime:starttime,
		endtime:endtime,
		correctNum:params.correctNum,
		deviceUnit:params.deviceUnit,
		correctUrl:params.correctUrl,
		subsubType:params.subType[1]?params.subType[1]:0
	}

	console.log(_change)

	let _params = ['ROMS202_INSTRUMENT',_change,{id:params.update_id}]
	let back = await db.update(_params)
	back.affected?res.json({success:true,msg:'更新成功'}):res.json({success:false,msg:'更新失败'})
}
//packpdf
function packpdf(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            projectId:req.body.id
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        console.log(content)
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!generate_mergeAll?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) { 
              resolve(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        
        req2.end();
    })
}
const device = {
	get_device:get_device,
	add_device:add_device,
	delete_device:delete_device,
	update_device:update_device,
	packpdf
}

module.exports = device
