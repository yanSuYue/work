const express = require('express')
const router = express.Router()
const project = require('../controller/sql/project.js')


router.get('/projects',(req,res)=>{
	project.queryProjectWithTask(res)
})
//deleteProject
router.post('/deleteProject',(req,res)=>{
	project.deleteProject(req.body.id,res)
})
router.post('/showprojects',(req,res)=>{
	project.showprojects(req,res)
})
//updateApply更新申请表状态
router.post('/updateApply',(req,res)=>{
	project.updateApply(req,res)
})

//updateReportModify更新报告修改表状态  task   重新检测
router.post('/updateReportModify',(req,res)=>{
	project.updateReportModify(req,res)
})
//updateReportModify更新报告修改表状态  doc    重新检测&&只修改非数据部分
router.post('/updateDocReportModify',(req,res)=>{
	project.updateDocReportModify(req,res)
})

//deleteReportModify 删除报告修改表记录
router.post('/deleteReportModify',(req,res)=>{
	project.deleteReportModify(req,res)
})

//updateReportModify更新报告修改表状态 task  只修改非数据部分
router.post('/updateReportModifyData',(req,res)=>{
	project.updateReportModifyData(req,res)
})



//searchProject
router.post('/simpleProject',(req,res)=>{
	project.querySimpleProject(req.body,res)
})
//searchByParams
router.post('/searchByParams',(req,res)=>{
	if(typeof req.body.pageSize != 'number' || typeof req.body.pageIndex != 'number'){
		res.json({msg:'数据类型错误',success:false})
		return
	}
	project.queryParamsProject(req.body,res)
})
//Deviate查询偏离表
router.post('/getDeviate',(req,res)=>{
	project.getDeviate(req.body,res)
})
//报告审核
router.post('/simpleProjectPassed',(req,res)=>{
	if(typeof req.body.pageSize != 'number' || typeof req.body.pageIndex != 'number'){
		res.json({msg:'数据类型错误',success:false})
		return
	}
	project.querySimpleProjectPassed(req.body,res)
	
})

//报告签发
router.post('/simpleProjectPassed2',(req,res)=>{
	if(typeof req.body.pageSize != 'number' || typeof req.body.pageIndex != 'number'){
		res.json({msg:'数据类型错误',success:false})
		return
	}
	project.querySimpleProjectPassed2(req.body,res)
	
})


//报告修改
router.post('/simpleProjectPassed3',(req,res)=>{
	if(typeof req.body.pageSize != 'number' || typeof req.body.pageIndex != 'number'){
		res.json({msg:'数据类型错误',success:false})
		return
	}
	project.querySimpleProjectPassed3(req.body,res)
	
})

router.post('/addProject',(req,res)=>{
	//console.log(req.body)
	//res.send({test:'ok'})
	if(!req.body){
		res.json({err:'参数为空'})
		return;
	}
	project.addProject(req.body,res)
})
module.exports = router