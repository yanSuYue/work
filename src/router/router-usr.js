const express = require('express')
const router = express.Router()
const usr = require('../sql/usr.js')


router.post('/allUsr',(req,res)=>{
	try{
		usr.get_usr(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/addprovincestaff',(req,res)=>{
	try{
		usr.addprovincestaff(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/getprovincestaff',(req,res)=>{
	try{
		usr.getprovincestaff(req,res)
	}catch(e){
		console.log(e)
	}
})

//getprovincestaff
//addprovincestaff

router.post('/get_usr_zk',(req,res)=>{
	try{
		usr.get_usr_zk(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/addUsr',(req,res)=>{
	try{
		usr.add_usr(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/updateUsr',(req,res)=>{
	try{
		usr.update_usr(req,res)
	}catch(e){
		console.log(e)
	}
})

router.post('/deleteUsr',(req,res)=>{
	try{
		usr.delete_usr(req,res)
	}catch(e){
		console.log(e)
	}
})

module.exports = router