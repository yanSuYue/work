const express = require('express')
const router = express.Router()
const template = require('../controller/sql/template.js')


router.post('/templates',(req,res)=>{
	if(!req.body.id){
		res.json({msg:'请确认参数'})
		return;
	}
	let deviceType = req.body.id 
	template.queryTemplateName(deviceType,res)
})
//ROMS_SZ_TEMPLATE
router.post('/gettemplate',(req,res)=>{

	template.gettemplate(req,res)
})
//addStandard
router.post('/addStandard',(req,res)=>{
	template.addStandard(req,res)
})
//updateStandard
router.post('/updateStandard',(req,res)=>{
	template.updateStandard(req,res)
})
//delStandard
router.post('/delStandard',(req,res)=>{
	template.delStandard(req,res)
})
module.exports = router