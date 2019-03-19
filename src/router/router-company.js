const express = require('express')
const router = express.Router()
const company = require('../sql/company.js')

router.post('/getAllCompany',(req,res)=>{
	try{
		company.get_company(req,res)
	}catch(e){
		console.log(e)
	}	
})

router.post('/getCompanyG',(req,res)=>{
	try{
		company.getCompanyG(req,res)
	}catch(e){
		console.log(e)
	}	
})

//getCompanyG
router.post('/getMonstation',(req,res)=>{
	try{
		company.getMonstation(req,res)
	}catch(e){
		console.log(e)
	}	
})

router.post('/getDistrict',(req,res)=>{
	try{
		company.getDistrict(req,res)
	}catch(e){
		console.log(e)
	}	
})

router.post('/addCompany',(req,res)=>{
	try{
		company.add_company(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/updateCompay',(req,res)=>{
	try{
		company.update_company(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/deleteCompany',(req,res)=>{
	try{
		company.delete_company(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/allGps',(req,res)=>{
	console.log(123333,req.body.params)
	try{
		company.get_all_gps_project(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/getSourceGps',(req,res)=>{
	try{
		company.get_source_by_companyId(req,res)
	}catch(e){
		console.log(e)
	}
})

router.get('/fakePos',(req,res)=>{
	try{
		company.get_single_project(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/fakeRound',(req,res)=>{
		try{
			company.get_round_line(req,res)
		}catch(e){
			console.log(e)
		}
})

module.exports = router