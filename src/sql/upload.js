const express = require('express')
const router = express.Router()
const multer = require('multer')
const time = require('easy-time-parser')

const timing = new time()
const config = require('../config/env.js')

const env = require('../config/env.js')

function add_companyImg(req,res){
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			//java项目也要使用此图片 存在java项目下
			cb(null,config.companyImgUrl)
		},
		filename:function(req,file,cb){
			cb(null,''+Date.now()+file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('company-sign')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'图片上传错误'})
		}else{
			console.log("图片上传成功")
			let baseUrl = 'static/'+req.file['filename']
			let javaUrl = '/companyImg/'+req.file['filename']
			res.json({success:true,msg:'图片上传成功',displayUrl:baseUrl,baseUrl:javaUrl})
		}
	})
}

function add_usrImg(req,res){
	console.log("add_usrImg");
	console.log("config.baseUrl="+config.baseUrl);
	console.log("env.val="+env.val);
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			
			cb(null,config.baseUrl)
		},
		filename:function(req,file,cb){
			
			cb(null,''+Date.now()+file.originalname)
		}
	})
	
	let upload = multer({storage:storage})
	
	let uploadx = upload.single('usr-sign')
	
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'图片上传错误'})
		}else{
			console.log("图片上传成功")
			let baseUrl = 'static/'+req.file['filename']
			let javaUrl = '/monuserImg/'+req.file['filename']
			res.json({success:true,msg:'图片上传成功',displayUrl:baseUrl,baseUrl:javaUrl})
		}
	})
	
}

function upload_data(req,res){
	let save
	//此处更改项目路径
	//env.val=='production'?save='/node_server/bsk/static/excel_data/':save='D:/GIT/bsk/static/excel_upload/'
	env.val=='production'?save='/node_server/lyy/bsk/static/excel_data/':save='D:/GIT/bsk/static/excel_upload/'

	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			cb(null,save)
		},
		filename:function(req,file,cb){
			cb(null,''+Date.now()+file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('upload-data')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'数据上传错误'})
		}else{
			//console.log("图片上传成功")
			let downloadUrl = 'static/excel_data/'+req.file['filename']
			res.json({success:true,msg:'数据上传成功',downloadUrl:downloadUrl})
		}
	})
}

function upload_doc(req,res){
	let save
	//此处更改项目路劲
	env.val=='production'?save='/node_server/lyy/bsk/static/doc_data/':save='D:/GIT/bsk/static/doc_upload/'
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			cb(null,save)
		},
		filename:function(req,file,cb){
			cb(null,file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('upload-doc')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'文档上传错误'})
		}else{
			//console.log("文档上传成功")
			let docUrl = 'static/doc_data/'+req.file['filename']
			res.json({success:true,msg:'文档上传成功',docUrl:docUrl,filename:req.file['filename']})
		}
	})
}
//人员上岗资格上传
function add_usrComfirm(req,res){
	let save = config.baseUrl;
	//此处更改了项目路劲  增加了/lyy
	//env.val=='production'?save='/node_server/lyy/bsk/static/usrComfirm/':save='D:/GIT/bsk/static/excel_upload/'
	
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			cb(null,save)
		},
		filename:function(req,file,cb){
			cb(null,''+Date.now()+file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('usr-comfirm')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'数据上传错误'})
		}else{
			//console.log("图片上传成功")
			let displayUrl = 'static/'+req.file['filename']
			res.json({success:true,msg:'数据上传成功',displayUrl:displayUrl})
		}
	})
}
//仪器检定证书图片上传
function add_deviceComfirm(req,res){
	let save = config.baseUrl;
	//env.val=='production'?save='/node_server/lyy/bsk/static/deviceComfirm/':save='D:/GIT/bsk/static/excel_upload/'
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			cb(null,save)
		},
		filename:function(req,file,cb){
			cb(null,''+Date.now()+file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('device-comfirm')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'数据上传错误'})
		}else{
			//console.log("图片上传成功")
			let displayUrl = 'static/'+req.file['filename']
			res.json({success:true,msg:'数据上传成功',displayUrl:displayUrl})
		}
	})
}

//站点资质上传
function add_stationComfirm(req,res){
	let save
	env.val=='production'?save='/node_server/lyy/bsk/static/stationComfirm/':save='D:/GIT/bsk/static/excel_upload/'
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			cb(null,save)
		},
		filename:function(req,file,cb){
			cb(null,''+Date.now()+file.originalname)
		}
	})
	let upload = multer({storage:storage})

	let uploadx = upload.single('station-comfirm')
	uploadx(req,res,function(err){
		if(err){
			console.log(err)
			res.json({success:false,err:'数据上传错误'})
		}else{
			//console.log("图片上传成功")
			let displayUrl = 'static/stationComfirm/'+req.file['filename']
			res.json({success:true,msg:'数据上传成功',displayUrl:displayUrl})
		}
	})
}
const upload = {
	add_usrImg:add_usrImg,
	add_companyImg:add_companyImg,
	upload_data:upload_data,
	upload_doc:upload_doc,
	add_usrComfirm:add_usrComfirm,
	add_deviceComfirm:add_deviceComfirm,
	add_stationComfirm:add_stationComfirm
}
	module.exports = upload
