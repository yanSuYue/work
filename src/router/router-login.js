const express = require('express')
const router = express.Router()

const login = require('../sql/login.js')


router.post('/checkLogin',(req,res)=>{
	try{
		login.login_check_admin(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER ERR'})
	}
})

router.post('/checkStation',(req,res)=>{
	try{
		login.login_check_station(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER ERR'})
	}
})

router.post('/checkExam',(req,res)=>{
	try{
		login.login_check_exam(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER ERR'})
	}
})
module.exports = router