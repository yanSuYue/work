const express = require('express')
const router = express.Router()

const device = require('../sql/device.js')

router.post('/packpdf',(req,res)=>{
	device.packpdf(req,res).then(e=>{
		res.json(e)
		console.log(e)
	}).catch(e=>{
		console.log(e)
		res.json(e)
	})
})
router.post('/getDevices',(req,res)=>{
	try{
		device.get_device(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/addDevice',(req,res)=>{
	try{
		device.add_device(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/updateDevice',(req,res)=>{
	try{
		device.update_device(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/deleteDevice',(req,res)=>{
	try{
		device.delete_device(req,res)
	}catch(e){
		console.log(e)
	}
})

module.exports = router