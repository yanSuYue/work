const express = require('express')
const obj = require('../controller/connect/sql-option.js')
const router = express.Router()
const path = require('path')
const pool = require('../controller/connect/mysql.js').pool(obj)

const multer = require('multer')

let baseUrl;
let docUrl;
let url
let env = process.env.NODE_ENV

const fileFilter=function(req,file,cb){
	if(file.fieldname=="usr-sign"){
		baseUrl = '/roms/tomcat6/webapps/roms/staffImg/'
		cb(null,true)
	}else if(file.fieldname=="word"){
		baseUrl = path.resolve(__dirname,'..','upload/words')
		cb(null,true)
	}else if(file.fieldname=="usr-power"){
		baseUrl = path.resolve(__dirname,'..','upload/power')
		cb(null,true)
	}else if(file.fieldname=="usr-power2"){
		baseUrl = path.resolve(__dirname,'..','upload/power')
		cb(null,true)
	}else if(file.fieldname=="upPdf"){
		baseUrl = path.resolve(`/roms/tomcat6/webapps/roms/roms_sz/${req.body.projectName}/${req.body.taskProNum}/${req.body.templateNum}/`)
		file.url = `http://120.77.153.63:8080/roms/roms_sz/${req.body.projectName}/${req.body.num}/${req.body.templateNum}/`
		cb(null,true)
	}else if(file.fieldname=="imgmanage"){
		baseUrl = path.resolve(__dirname,'..','upload/imgmanage')
		cb(null,true)
	}
	else{
		file.id=req.body.id;
		baseUrl = path.resolve(`/roms/tomcat6/webapps/roms/roms_sz/${req.body.projectName}/${req.body.num}/${req.body.templateNum}/`)
		file.url = `http://120.77.153.63:8080/roms/roms_sz/${req.body.projectName}/${req.body.num}/${req.body.templateNum}/`
		cb(null,true)
	}
}
const storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,baseUrl)
	},
	filename:function(req,file,cb){
		cb(null,Date.now()+file.originalname)
	}
})

//imgmanage
const upload = multer({storage,fileFilter})
const uploadx = upload.single('usr-sign')
const uploadximg = upload.single('imgmanage')
const uploadxs = upload.single('usr-power')
const uploadxs2 = upload.single('usr-power2')
const uploadWord = upload.single('word')
/////111111
const uploadpdf = upload.single('upPdf')
///1
const uploadnewword = upload.single('newword')
//upPdf
router.post('/usr-sign',(req,res)=>{
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({err:'图片上传错误'})
		}else{
			if(req.file){
				let javaUrl
				let baseUrl
				baseUrl = 'static/'+req.file['filename']
				javaUrl = '/staffImg/'+req.file['filename']
				res.json({success:true,msg:'附件上传成功',displayUrl:baseUrl,uploadUrl:javaUrl})
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})
router.post('/imgmanage',(req,res)=>{
	uploadximg(req,res,function(err){
		if(err){
			console.log(err)
			res.json({err:'图片上传错误'})
		}else{
			if(req.file){
				let chartUrl = 'static/'+req.file['filename']
				res.json({success:true,msg:'附件上传成功',chartUrl:chartUrl})
			}else{
				res.json({success:false,msg:"上传的附件错误"})
			}
		}
	})
})

//updateupPdf
router.post('/upPdf',(req,res)=>{
	uploadpdf(req,res,function(err){
		if(err){
			console.log(err)
			res.json(err)
			
		}else{
			if(req.file){
				let url=`${req.file.url}${req.file.filename}`
				let id=req.body.id
				updateupPdf(url,id,res)
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})


//upnewword
router.post('/newword',(req,res)=>{
	uploadnewword(req,res,function(err){
		if(err){
			console.log(err)
			res.json(err)
			
		}else{
			if(req.file){
				let url=`${req.file.url}${req.file.filename}`
				let id=req.file.id
				updatenewword(url,id,res)
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})

function updatenewword(url,id,res){
	let sql = `update  ROMS_SZ_DOC  set docUrl='${url}'`
	pool.query(sql,(err,rows,field)=>{
		if(err){
			res.json(err)
		}else{
			res.json({success:true,msg:'报告上传成功'})
		}
		
	})
}

function updateupPdf(url,id,res){
	let sql = `update  ROMS_SZ_DOC  set docUrl='${url}'`
	pool.query(sql,(err,rows,field)=>{
		if(err){
			res.json(err)
		}else{
			res.json({success:true,msg:'报告上传成功'})
		}
		
	})
}


router.post('/measureDataUrl',(req,res)=>{
	let sql = `update  ROMS_SZ_TASK  set measureDataUrl=${req.body.measureDataUrl} WHERE id='${req.body.id}'`
	pool.query(sql,(err,rows,field)=>{
		if(err)reject(err)
		res.json({success:true,msg:'更新成功!'})
	})
})

//measureDataUrl

//delauthPhoto
router.post('/usr-power',(req,res)=>{
	uploadxs(req,res,function(err){
		if(err){
			console.log(err)
			res.json({err:'图片上传错误'})
		}else{
			if(req.file){
				let url = 'power/'+req.file['filename']
					res.json({success:true,msg:'附件上传成功',url})
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})

//delauthPhoto
router.post('/usr-power2',(req,res)=>{
	uploadxs2(req,res,function(err){
		if(err){
			console.log(err)
			res.json({err:'图片上传错误'})
		}else{
			if(req.file){
				let url = 'power/'+req.file['filename']
				let promise = new Promise((resolve,reject)=>{
					console.log(req.body)
					let sql = `update ROMS_SZ_STAFFAUTH set photoUrl='${url}' where id='${req.body.authId}'`
					pool.query(sql,(err,rows,field)=>{
						if(err)reject(err)
						resolve()
					})
				})
				promise.then(()=>{
					res.json({success:true,msg:'附件上传成功',url})
				})
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})

router.post('/delauthPhoto',(req,res)=>{
	let sql = `delete from ROMS_SZ_STAFFAUTH WHERE id='${req.body.authId}'`
	pool.query(sql,(err,rows,field)=>{
		if(err)reject(err)
		res.json({success:true,msg:'删除权限成功！'})
	})
})

router.post('/words',(req,res)=>{
	uploadWord(req,res,function(err){
		if(err){
			console.log(err)
			res.json({err:'上传失败'})
		}else{
			if(req.file){
				let baseUrl
				if(env=='production'){
					baseUrl = 'words/'+req.file['filename']
				}else if(env=='198'){
					baseUrl = 'words/'+req.file['filename']
				}else{
					 baseUrl = 'words/'+req.file['filename']					
				}
				res.json({success:true,msg:'附件上传成功',displayUrl:baseUrl})
			}else{
				res.json({success:false,msg:"上传的附件类型不支持"})
			}
		}
	})
})
 

 module.exports = router