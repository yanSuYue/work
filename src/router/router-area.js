const express = require('express')
const router = express.Router()

const area = require('../sql/area.js')


router.get('/province',(req,res)=>{
	try{
		console.log('------------------------',req.session.id)
		area.getProvince(req,res)
	}catch(e){
		console.log(e)
	}
})
//stationslist
router.get('/stationslist',(req,res)=>{
	try{
		area.stationslist(req,res)
	}catch(e){
		console.log(e)
	}
})
router.post('/city',(req,res)=>{
	try{
		area.getCity(req,res)
	}catch(e){
		console.log(e)
	}
})


router.post('/delstation',(req,res)=>{
	area.delStaion(req,res).catch(e=>{
		res.json({success:false})
	})
})
router.post('/updatestation',(req,res)=>{
	area.updateStaion(req,res)
})
router.post('/getsStaion',(req,res)=>{
	area.getsStaion(req,res)
})
router.post('/getsStaion2',(req,res)=>{
	area.getsStaion2(req,res)
})
router.post('/addstation',(req,res)=>{
	console.log(area.addstation)
	area.addstation(req,res)
	
})
//addstation
router.post('/getstrict',(req,res)=>{
	area.getstrict(req,res)
})
//getstrict
router.post('/district',(req,res)=>{
	try{
		area.getDistrict(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/station',(req,res)=>{
	try{
		area.getStation(req,res)
	}catch(e){
		console.log(e)
	}
})
router.get('/allStations',(req,res)=>{
	try{
		area.getAllStations(req,res)
	}catch(e){
		console.log(e)
	}
})
module.exports = router