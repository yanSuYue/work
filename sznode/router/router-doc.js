const express = require('express')
const router = express.Router()
const Doc = require('../controller/sql/doc.js')
const project = require('../controller/sql/project.js')

//updateTaskReportSummary更新报告归档表状态  task   重新检测
router.post('/updateTaskReportSummary',(req,res)=>{
	Doc.updateTaskReportSummary(req,res)
})

//updateReportSummary更新报告 归档表状态  doc    重新检测&&只修改非数据部分
router.post('/updateDocReportSummary',(req,res)=>{
	Doc.updateDocReportSummary(req,res)
})

//deleteReportSummary 删除报告归档表记录
router.post('/deleteReportSummary',(req,res)=>{
	Doc.deleteReportSummary(req,res)
})

//updateReportSummaryData更新报告档案表状态 task  只修改非数据部分
router.post('/updateReportSummaryData',(req,res)=>{
	Doc.updateReportSummaryData(req,res)
})


router.post('/makeDoc',(req,res)=>{
	Doc.makeDoc(req.body,res)
})

router.post('/ProjectWithDoc',(req,res)=>{
	project.querySimpleProjectHasDoc(req.body,res)
})
//updateSize
router.post('/updateSize',(req,res)=>{
	Doc.updateSize(req.body,res)
})

router.post('/nopassSure',(req,res)=>{
	let obj = req.body
	Doc.nopassSure(obj,res).then(e=>{
		res.json({success:true,msg:'操作成功！'})
	}).catch(e=>{
		console.log(e)
		res.json({e})
	})
})


router.post('/nopassSure3',(req,res)=>{
	let obj = req.body
	Doc.nopassSure2(obj,res).then(e=>{
		res.json({success:true,msg:'操作成功！'})
	}).catch(e=>{
		res.json({e})
	})
})
//updateprintsize
router.post('/updateprintsize',(req,res)=>{
	let obj = req.body
	Doc.updateprintsize(obj,res).then(e=>{
		res.json({success:true,message:'记录成功！'})
	}).catch(e=>{
		res.json({e})
	})
})


//getDocInfo
router.post('/getDocInfo',(req,res)=>{
	Doc.getDocInfo(req,res)
})

module.exports = router