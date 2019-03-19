const http = require('http');  
const qs = require('querystring');
const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const company = require('./company.js')
const area = require('./area.js')
const project = require('./project.js')
async function get_excel_task_list(req,res){

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
	let excel = req.session.excel

	//admin用户
	//if(admin){
		let _sql = 'select ?? from ?? where type=1 or type=2 order by createtime desc limit ?,? '
		let _key = ['id','type','projectId','measureDataPdfUrl','measureDataUrl','pass']
		let _params = [_key,'ROMS202_TASK',pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)
		let _count_sql = `select count(id) as count from ROMS202_TASK where type=1 or type=2`
		let _count_obj = await db.raw_select(_count_sql,[])
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
			i['code'] = reback.code
			reback.companyUrl=='undefined'?i['companyUrl']=false:i['companyUrl']=reback.companyUrl
			console.log(i)
			return i
		})
		Promise.all(list)
		.then(r=>res.json({lists:r,count:count}))
		.catch(e=>res.json({lists:[],count:0}))
	// }else{
	// 	res.json({lists:[],count:0})
	// }

}

async function get_all_share_doc(req,res){
	let _sql = 'select * from ROMS202_SHARE order by createtime desc limit ?,?'
}

async function get_single_task(req,res){
	if(!req.body.companyCode){
		res.json({success:false,msg:'缺少参数'})
		return
	}else{
		let companyCode = req.body.companyCode
		let  likeStr = companyCode+'%'
		let _sql = `select
		t.id,t.type,t.projectId,t.measureDataPdfUrl,t.measureDataUrl,t.pass,
		p.moncompanyId,p.companyUrl,p.companyCode code,p.type test_type,
		c.moncompanyName name,c.districtId,c.mineralSpecies,
		d.districtName district
		from ROMS202_TASK t
		inner join ROMS202_PROJECT p
		on t.projectId = p.id
		inner join ROMS202_MONCOMPANY c
		on p.moncompanyId = c.id
		inner join ROMS202_DISTRICT d
		on c.districtId = d.id
		where p.companyCode like ?
		`
		let back = await db.raw_select(_sql,[likeStr])

		if(back.success){
			res.json({success:true,lists:back.result,count:back.count})
		}else{
			res.json({success:false,lists:[],count:0})
		}
	}
}

async function excel_upload(req,res){
	let taskId = req.body.taskId
	let excelUrl = req.body.excelUrl
	if(taskId==''||excelUrl==''){
		res.json({success:false,msg:'参数不能空'})
	}else{
		let _keys = {
			excelUrl:excelUrl
		}
		let _params={
			id:taskId
		}
		let back = await db.update(['ROMS202_TASK',_keys,_params])
		if(back.affected){
			res.json({success:true,msg:'上传成功'})
		}else{
			res.json({success:false,msg:'上传失败'})
		}
	}
}

async function doc_upload(req,res){
	let docUrl=req.body.docUrl
	let name=req.body.fileName
	console.log(name,'--------------------')
	let createtime = timing.now()
	let id = uuid()
	let author = req.session.user
	if(!docUrl){
		res.json({success:false,msg:'缺少参数'})
	}else{
		let obj = {
			docUrl:docUrl,
			createtime:createtime,
			id:id,
			name:name,
			author:author
		}
		let back = await db.insert('ROMS202_SHARE',obj)
		if(back.affected){
			res.json({success:true,msg:'上传成功'})
		}else{
			res.json({success:false,msg:'上传失败'})
		}
	}
}

async function get_all_doc(req,res){
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart
	let pageEnd
	let admin = req.session.admin
	let monstationId = req.session.stationId
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd = pageSize
	}
	if(true){
		let _count_sql = `select count(*) as count from ROMS202_SHARE`
		let _count_back = await db.raw_select(_count_sql,[])
		if(_count_back.success){
			let count = _count_back.result[0].count
			//let _sql = `select S.*,U.monuserName user from ROMS202_SHARE S join ROMS202_MONUSER U on U.id= S.monuserId order by createtime desc limit ?,?`
			let _sql = `select * from ROMS202_SHARE order by createtime desc limit ?,?`
			let back = await db.raw_select(_sql,[pageStart,pageEnd])
			if(back.success){
				console.log(back,'-----------------')
				let mapList = back.result.map(async(item)=>{
					if(item.author!='admin'){
						let _sql_user = `select monuserName from ROMS202_MONUSER where id = ?`
						let author_back = await db.raw_select(_sql_user,[item.author])
						if(author_back.success){
							item['user']=author_back.result[0].monuserName

						}else{
							//
						}
					}else{

						item['user']='admin'

					}
					item.createtime=timing.format(item.createtime)
					console.log('item-----',item)
					return item
				})

				Promise.all(mapList)
				.then(list=>{
					res.json({success:true,lists:list,count:count,msg:'查询成功'})
				})
				.catch(err=>{
					res.json({success:true,lists:mapList,count:count,msg:'查询成功'})
				})
				//res.json({success:true,lists:back.result,count:count,msg:'查询成功'})

			}else{
				res.json({success:false,lists:[],count:0,msg:'暂无数据'})
			}
		}else{
			res.json({success:false,lists:[],count:0,msg:'暂无数据'})
		}
	}
}

function downpack(req,res){
    return new Promise((resolve,reject)=>{
		let res2=res;
		console.log('99999999999999999')
		console.log(req.body.id)
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
		  console.log('99999999999999999') 
          res.on('data', function (chunk) {  
			res2.json(chunk) 
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}

const excel ={
	get_excel_task_list:get_excel_task_list,
	excel_upload:excel_upload,
	doc_upload:doc_upload,
	get_all_doc:get_all_doc,
	downpack
}

module.exports = excel
