const express = require('express')
const router = express.Router()
const upload = require('../sql/upload.js')

router.post('/company-sign',(req,res)=>{
	try{
		upload.add_companyImg(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/usr-sign',(req,res)=>{
	try{
		upload.add_usrImg(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/upload-data',(req,res)=>{
	try{
		upload.upload_data(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/upload-doc',(req,res)=>{
	try{
		upload.upload_doc(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR',})
	}
})

router.post('/upload-usrComfirm',(req,res)=>{
	try{
		upload.add_usrComfirm(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR',})
	}
})
router.post('/upload-deviceComfirm',(req,res)=>{
	try{
		upload.add_deviceComfirm(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR',})
	}
})
router.post('/upload-stationComfirm',(req,res)=>{
	try{
		upload.add_stationComfirm(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR',})
	}
})


 module.exports = router
