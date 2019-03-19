const express = require('express')
const router = express.Router()
const staff = require('../sql/staff.js')


router.post('/getStaffs',(req,res)=>{
	try{
		staff.get_staff(req,res)
	}catch(e){
		console.log(e)
	}
})

// router.post('/allUsr',(req,res)=>{
// 	try{
// 		staff.get_staff(req,res)
// 	}catch(e){
// 		console.log(e)
// 	}
// })
router.post('/addStaff',(req,res)=>{
	try{
		staff.add_staff(req,res)
	}catch(e){
		console.log(e)
	}
})
router.post('/deleteStaff',(req,res)=>{
	try{
		staff.delete_staff(req,res)	
	}catch(e){
		console.log(e)
	}
})
router.post('/updateStaff',(req,res)=>{
	try{
		staff.update_staff(req,res)
	}catch(e){
		console.log(e)
	}
})
module.exports = router