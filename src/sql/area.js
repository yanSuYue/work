const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()

	async function getProvince(req,res){
		let _sql = `select ?? from  ?? `
		let _params = [['id','provinceName'],'ROMS202_PROVINCE']
		let back = await db.raw_select(_sql,_params)
		console.log(back)
		res.json({provices:back.result})
	}

	async function getCity(req,res){
		let params = req.body
		let _sql = `select ?? from ?? where provinceId = ?`
		let _params = [['id','cityName'],'ROMS202_CITY',params.provinceId]
		let back = await db.raw_select(_sql,_params)
		console.log(back)
		res.json({cities:back.result})
	}

	//getCity('99574ab5-7266-11e7-af8e-14187743d00e')

	async function getDistrict(req,res){
		let params = req.body
		let _sql = `select ?? from ?? where cityId = ?`
		console.log(params)
		let _params = [['id','districtName','code'],'ROMS202_DISTRICT',params.cityId]
		let back = await db.raw_select(_sql,_params)
		console.log(back)
		res.json({district:back.result})
	}
	//getDistrict('ccbe70b5-7266-11e7-af8e-14187743d00e')

	async function getStation(req,res){
		//todo 
		let params = req.body
		let districtId = params.districtId 
		let _sql =`select ?? from ?? where districtId = ?`
		let _params = [['monstationName','id'],'ROMS202_MONSTATION',districtId]
		let back = await db.raw_select(_sql,_params)
		console.log(back)
		res.json({stations:back.result})
	}

	async function getAllStations(req,res){
		let _sql =`select ?? from ??`
		let _params = [['monstationName','id'],'ROMS202_MONSTATION']
		let back = await db.raw_select(_sql,_params)
		if(back.success){
			res.json({stations:back.result})
		}else{
			res.json({stations:[]})
		}
	}
	async function getDistrictName(stationId){
		if(!stationId){
			return ''
		}
		let _sql = `select districtName from ROMS202_DISTRICT where id = ?`
		let _params = [stationId]
		let back = await db.raw_select(_sql,_params)
		if(back.success){
			return back.result[0].districtName
		}else{
			return ''
		}
	}
//getsStaion
async function getsStaion(req,res){
	let page = req.body.nowpage*10
	let _sql = `select a.*,b.districtName,c.cityName,d.provinceName from ROMS202_MONSTATION a 
	join ROMS202_DISTRICT b on a.districtId=b.id join ROMS202_CITY c on c.id=b.cityId join ROMS202_PROVINCE d
	on d.id=c.provinceId order by createtime limit ${page},10`
	let __sql = `select count(*) as count from ROMS202_MONSTATION a join ROMS202_DISTRICT b on a.districtId=b.id join ROMS202_CITY c on c.id=b.cityId join ROMS202_PROVINCE d on d.id=c.provinceId`
	let _params = []
	let back = await db.raw_select(_sql,_params)
	let count = await db.raw_select(__sql,_params)
	if(back.success){
		res.json({stations:back.result,count:count.result[0].count})
	}else{
		return ''
	}
}


//getsStaion2


async function getsStaion2(req,res){
	let _sql = `select id as value,monstationName as label from ROMS202_MONSTATION `
	console.log(_sql)
	let _params = []
	let back = await db.raw_select(_sql,_params)
	res.json({stations:back.result})
}
//stationslist
async function stationslist(req,res){
	let _sql = `select id as value,monstationName as label from ROMS202_MONSTATION `
	let _params = []
	let back = await db.raw_select(_sql,_params)
	res.json({stations:back.result})
}

async function updateStaion(req,res){
	let str=[]
	for(let item in req.body.ruleForm){
		if(item=='id'){continue}
		str.push(item+'='+`'${req.body.ruleForm[item]}'`)
	}
	console.log(str)
	let _sql = `update ROMS202_MONSTATION set ${str.join(',')} where id='${req.body.ruleForm.id}'`
	console.log(_sql)
	let _params = []
	
	let back = await db.raw_select(_sql,_params)
	res.json({success:back.success})
}
async function delStaion(req,res){
	let _sql = `delete from  ROMS202_MONSTATION where id='${req.body.id}'`
	let _params = []
	let back = await db.raw_select(_sql,_params)
	res.json({success:back.success})
}
//addstation
//getsStaion
//updateStaion
//delStaion
async function addstation(req,res){
	let id = uuid()
	let createtime = timing.now()
	let str1=`id,createtime`
	let str2=`'${id}','${createtime}'`
	for(let item in req.body.ruleForm){
		console.log(item)
		str1+=`,${item}`
		if(item=='districtId'){
			str2+=`,'${req.body.ruleForm[item][2]}'`
		}else{
			str2+=`,'${req.body.ruleForm[item]}'`
		}
	}
	let _sql = `insert into ROMS202_MONSTATION (${str1}) values (${str2})`
	console.log(_sql)
	let _params = []
	let back = await db.raw_select(_sql,_params)
	res.json({success:back.success})
}
//getsStaion
/*
async function getstrict(req,res){
	let _sql = `select id as value,provinceName as label from ROMS202_PROVINCE `
	let _sql_ = `select provinceId,id as value,cityName as label from ROMS202_CITY `
	let _sql__ = `select code, cityId,id as value,districtName as label from ROMS202_DISTRICT `
	let _params = []
	let province = await db.raw_select(_sql,_params)
	let city = await db.raw_select(_sql_,_params)
	let district = await db.raw_select(_sql__,_params)
	let options=province.result
	
	for(let i=0;i<options.length;i++){
		options[i].children=[]
		for(let j=0;j<city.result.length;j++){
			city.result[j].children=[]
			for(let j2=0;j2<district.result.length;j2++){
				if(city.result[j].value==district.result[j2].cityId){
					city.result[j].children.push(district.result[j2])
				}
			}
			if(options[i].value==city.result[j].provinceId){
				options[i].children.push(city.result[j])
			}
		}
	}
	
	res.json({options})
}
*/
async function getstrict(req,res){
	let sql_province = `select id as value,provinceName as label from ROMS202_PROVINCE `
	//let _sql_ = `select provinceId,id as value,cityName as label from ROMS202_CITY `
	//let _sql__ = `select code, cityId,id as value,districtName as label from ROMS202_DISTRICT `
	//let _params = []
	let province = await db.raw_select(sql_province,[])
	//let city = await db.raw_select(_sql_,_params)
	//let district = await db.raw_select(_sql__,_params)
	//let ret_data=province.result
	let options=province.result
	for(let i=0;i<options.length;i++){
		let sql_city = `select provinceId,id as value,cityName as label from ROMS202_CITY where provinceId= ? `
		let city = await db.raw_select(sql_city,[options[i].value])
		options[i].children=city.result;
		
		for(let j=0;j<city.result.length;j++){
			
			
			let sql_district = `select code, cityId,id as value,districtName as label from ROMS202_DISTRICT where  cityid = ? `
			
			let district = await db.raw_select(sql_district,[city.result[j].value])
			options[i].children[j].children=district.result;
			/*
			for(let j2=0;j2<district.result.length;j2++){
				if(city.result[j].value==district.result[j2].cityId){
					city.result[j].children.push(district.result[j2])
				}
			}
			if(options[i].value==city.result[j].provinceId){
				options[i].children.push(city.result[j])
			}
			*/
		}
	}
	
	res.json({options})
}
const area = {
	getProvince:getProvince,
	getCity:getCity,
	getDistrict:getDistrict,
	getStation:getStation,
	getDistrictName:getDistrictName,
	getAllStations:getAllStations,
	getsStaion,
	getstrict,
	addstation,
	updateStaion,
	delStaion,
	getsStaion2,
	stationslist
}

module.exports = area