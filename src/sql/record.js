const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const company = require('./company.js')
const area = require('./area.js')
async function get_record_list(req,res){

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

	let count 
	let admin = req.session.admin
	let monstationId = req.session.stationId
	//admin用户
	if(admin){

		let _sql = 'select ?? from ??  where type = ? order by createtime desc limit ?,? '
		let _key = ['id','type','moncompanyId','phone']
		let _params = [_key,'ROMS202_PROJECT',1,pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)
		//分页总条数
		/*---------09-22-----------*/
		let _count_sql = `select count(*) as count from ROMS202_PROJECT where type = 1`
		let _count_back = await db.raw_select(_count_sql,[])
		if(_count_back.success){
			count = _count_back.result[0].count
		}else{
			count = 0
		}
		/*---------09-22-----------*/
		
		//旧分页条数逻辑
		/*
		let _count_obj = await db.countTable('ROMS202_PROJECT')
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}
		*/
		//console.log(back)
		let list = back.result.map( async (i)=>{
			let obj = await company.get_company_name_type(i.moncompanyId)
			let district = await area.getDistrictName(obj.id)
			i['mime'] = obj.type
			i['name'] = obj.name
			i['district'] = district
			return i
		})


		Promise.all(list)
		.then(r=>res.json({lists:r,count:count}))
		.catch(e=>res.json({lists:[],count:0}))

	}else if(monstationId){
		//地方站点用户
		let _sql = 'select ?? from ?? where monstationId = ? and type = ? order by createtime desc limit ?,? '
		let _key = ['id','type','moncompanyId','phone']
		let _params = [_key,'ROMS202_PROJECT',monstationId,1,pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)

		let count_sql = 'select count(*) as count from ?? where monstationId = ? and type = ?'
		let count_params = ['ROMS202_PROJECT',monstationId,1]
		let _count_obj = await db.raw_select(count_sql,count_params)
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}

		//console.log(back)
		let list = back.result.map( async (i)=>{
			let obj = await company.get_company_name_type(i.moncompanyId)
			let district = await area.getDistrictName(obj.id)
			i['mime'] = obj.type
			i['name'] = obj.name
			i['district'] = district
			return i
		})


		Promise.all(list)
		.then(r=>res.json({lists:r,count:count}))
		.catch(e=>res.json({lists:[],count:0}))
		
	}
	
}

//get_record_list()


const record ={
	get_record_list : get_record_list
}

module.exports = record


	// let count = await db.countTable('ROMS202_PROJECT')

	// let _sql = 'select ?? from ??  where monstationId = ? '
	// 	let _key = ['id']
	// 	let _params = [_key,'ROMS202_MONCOMPANY',monstationId]
	// 	let back = await db.raw_select(_sql,_params)
	// 	if(!back.success){
	// 		res.json({lists:[],count:0})
	// 	}else{
	// 		let ok = []
	// 		let _sql = 'select ?? from ??  where moncompanyId = ? '
	// 		let _key = ['id','type','moncompanyId','phone']
			
	// 		let list = back.result.map(async (i)=>{
	// 			let _params = [_key,'ROMS202_PROJECT',i.id]
	// 			let back = await db.raw_select()
	// 			return back.result
	// 		})

	// 		Promise.all(list)
	// 		.then(r=>{
	// 			r.forEach((i)=>{ok.concat(i)})
	// 		})
	// 		.then(()=>{
	// 			res.json({lists:ok,count})
	// 		})
	// 	}