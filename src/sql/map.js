const database = require('async-mysql-query')
const db = new database({
	host:'192.168.1.198',
	user:'root',
	password:'linkivr2016!roms',
	database:'roms'
})







async function get_company_by_city(cityId){
	let _sql = 'select id,districtId,moncompanyName,mineralSpecies from ROMS202_MONCOMPANY where cityId = ?'
	let back = db.raw_select(_sql,[cityId])
	if(back.success){
		console.log(back.result)
	}else{
		//todo
	}
}

async function get_all_project(){
	let _sql = 'select type,id,lat,lng,monstationId,moncompanyId from ROMS202_PROJECT'
	let back = await db.raw_select(_sql,[])
	if(back.success){
		let list 
		list = back.result.map(async (i)=>{
			let companyInfo = await get_company_by_project(i.moncompanyId)
			if(companyInfo){
				i.companyName = companyInfo
			}else{
				i.companyName = '未找到此企业'
			}
			return i
		})
		Promise.all(list)
		.then(r=>{
			//返回给前台
			console.log(r)
		})
		
	}else{
		//todo
	}
}

//第一级 返回所有项目的点
async function get_company_by_project(companyId){
	console.log(`查询站点 ${companyId}`)
	let _sql = 'select moncompanyName as companyName from ROMS202_MONCOMPANY where id = ?'
	let back = await db.raw_select(_sql,[companyId])
	if(back.success){
		return back.result[0].companyName
	}else{
		return ''
	}
}

//get_all_project()
//返回 某一个项目下 每个任务下的 测点点
async function get_task_by_projectId(projectId){
	let _sql = 'select id from ROMS202_TASK where projectId = ? '
	let back = await db.raw_select(_sql,[projectId])
	console.log(back)
	if(back.success){
		let list 
		list = back.result.map(async (i)=>{
			//console.log(i.id)
			let _back = await get_all_taskPoint_by_task(i.id)
			return _back			
		})
		console.log(list)
		Promise.all(list)
		.then((i)=>{
			//返回给前台
			console.log(i)
		})
		.catch(e=>{
			//告知前台
			console.log(e)
		})
	}
}

//查询任务下所有矿山的点
async function get_five_taskPoint_by_task(taskid){
	let _sql = 'select sampleArea,type,result,pointNum,lat,lng from ROMS202_TASKPOINT where taskId = ? group by sampleArea'
	let back = await db.raw_select(_sql,[taskid])
	if(back.success){
		return back.result
	}else{
		//todo
	}
}

//第四级返回任务下所有测点的点
async function get_all_taskPoint_by_task(taskid){
	let _sql = 'select id,type,sampleArea,result,pointNum,lat,lng from ROMS202_TASKPOINT where taskId = ?'
	let back = await db.raw_select(_sql,[taskid])
	return back.result
}



//get_all_taskPoint_by_task('c43389c9-ff5e-488a-9053-8d0fbe033784')

//get_task_by_projectId('2cd2f664-156d-4861-b66b-3d2402390bde')


//如果是x-r剂量率(type = 0) 去TASKDATA找值
async function get_xy_data(taskPointId){
	let _sql = 'select * from ROMS202_TASKDATA where taskPointId = ?'
	let back = await db.raw_select(_sql,[taskPointId])
	if(back.success){
		return back.result
	}else{
		//todo
	}
}
/*
	private String id;
	private Date createtime;//创建时间
	private Date sampleTime;//采样时间
	private String pointNum;//测点编号
	private int num;//编号（用于排序）
	private String depict;//测量描述（位置）
	private String avg;//平均读数
	private String result;//测量结果
	private String lng;//经度
	private String lat;//纬度
	private String sampleType;//样品种类(样品类型)
	private String sampleName;//样品名字
	private String sampleForm;//样品形态与包装
	private String sampleAmount;//样品量
	private String sampleArea;//样品区域
	private String sampleState;//样品状态
	private String way;//采样方式
	private String weather;//天气
	private String floats;//是否有漂浮物
	private String instructions;//稳定剂加入说明
	private String analyzeProject;//分析项目
	private String note;//备注
	private String data;//平板json数据
	private String radium226;//镭-226
	private String thorium232;//钍-232
	private String totalAlpha;//总α
	private String totalBeta;//总β
	private String totalThorium;//总钍
	private String totalUranium;//总铀
	private String uranium228;//铀-228
	private int type;//模板,0表示X-γ辐射剂量率，1表示水的采样，2表示土壤等固体的采样,3表示水样γ核素分析记录表，4表示土壤等固体γ核素分析记录表

*/
//如果是水样和固体采样(type!=0)
async function get_normal_data(taskid){
	let _keys = ['pointNum','radium226','thorium232','uranium228','totalAlpha','totalBeta','totalThorium','totalUranium'] 
	let _sql = 'select ?? from ROMS202_TASKPOINT where taskId = ?'
	let _params = [_keys,taskid]
	let back = await db.raw_select(_sql,_params)
	if(back.success){
		console.log(back.result)
	}else{
		//todo
	}
}

get_normal_data('b706658c-8cec-40a0-a899-320de3acbb4a')

