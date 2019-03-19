const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const company = require('./company.js')
const area = require('./area.js')
const project = require('./project.js')
async function get_doc_pass_list(req,res){

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
		let _sql = 'select ?? from ?? where pass = 2 order by createtime desc limit ?,? '
		let _key = ['id','type','projectId','measureDataPdfUrl','measureDataUrl','pass']
		let _params = [_key,'ROMS202_TASK',pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)
		let _count_obj = await db.countTable('ROMS202_TASK')
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}

		let list = back.result.map( async (i)=>{
			let reback = await project.getCompany(i.projectId)
			let district = await project.getDistict(reback.id)
			i['mime'] = district.type
			i['name'] = district.name
			i['district'] = district.district
			i['test_type'] = reback.type
			
			return i
		})


		Promise.all(list)
		.then(r=>res.json({lists:r,count:count}))
		.catch(e=>res.json({lists:[],count:0}))

	}else if(monstationId){
		//地方站点用户
		//先获取所有检测人员  然后遍历检测人员任务数据

		let _sql = 'select ?? from ?? where monstationId = ? and pass = 2 order by createtime desc limit ?,? '
		let _key = ['id','type','projectId','measureDataPdfUrl','measureDataUrl','pass']
		let _params = [_key,'ROMS202_TASK',monstationId,pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)

		let count_sql = 'select count(*) as count from ?? where monstationId = ?'
		let count_params = ['ROMS202_TASK',monstationId]
		let _count_obj = await db.raw_select(count_sql,count_params)
		if(_count_obj.success){
			count = _count_obj.result[0].count
		}else{
			count = 0
		}

		let list = back.result.map( async (i)=>{
			let reback = await project.getCompany(i.projectId)
			let district = await project.getDistict(reback.id)
			i['mime'] = district.type
			i['name'] = district.name
			i['district'] = district.district
			i['test_type'] = reback.type
			return i
		})


		Promise.all(list)
		.then(r=>res.json({lists:r,count:count}))
		.catch(e=>res.json({lists:[],count:0}))
		
	}
	
}

function downpack(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            projectId:req.body.id
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!projectZip?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}

const doc ={
	get_doc_pass_list : get_doc_pass_list,
	downpack
}

module.exports = doc

