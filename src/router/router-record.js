const express = require('express')
const router = express.Router()

const record = require('../sql/record.js')


router.post('/getRecord',(req,res)=>{
	try{
		record.get_record_list(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER_ERR'})
	}
})

module.exports = router