const obj = require('../controller/connect/sql-option.js')
const pool = require('../controller/connect/mysql.js').pool(obj)
const express = require('express')
const router = express.Router()
const task = require('../controller/sql/task.js')
const parseTime2 = require('../controller/public/timeParse.js').parseTime2

router.post('/addTask',(req,res)=>{
	let obj = req.body
	console.log('-------------------添加任务信息----------------',obj)
	if(obj.data.subCompanyId==='undefined'){
		res.json({success:false,msg:'管理员无法操作！'})
		return;
	}
	if(!obj.data||obj.data.projectId==''||obj.data.mapLat==''||obj.data.mapLng==''){
		console.log('添加任务参数不正确')
		res.json({msg:'请确认参数信息'})
		return;
	}
	task.addDiffTaskInfo(req.body,res)
})
//updateIsSend


router.post('/updateIsSend',(req,res)=>{
	let obj = req.body
	task.updateIsSend(req.body,res)
})

router.get('/excel',(req,res)=>{
	task.excel(req,res)
})

//nopassSure2
//nowstate
router.post('/nowstate',(req,res)=>{
	let obj = req.body
	task.nowstate(obj,res)
})

router.post('/makeTaskDoc',(req,res)=>{

		task.makeTaskDoc(req,res)
	
})
router.post('/nopassSure2',(req,res)=>{
	let obj = req.body
	task.nopassSure2(obj,res)
})

router.post('/showtasks',(req,res)=>{

	task.showtasks(req,res)
})
//showceshitask
router.post('/showceshitask',(req,res)=>{

	task.showceshitask(req,res)
})
router.post('/showtasks2',(req,res)=>{

	task.showtasks2(req,res)
})
//copyTask
router.post('/copyTask',(req,res)=>{
	
	task.copyTask(req,res)
})
//addDeviateSql偏离表
router.post('/addDeviateSql',(req,res)=>{
	
	task.addDeviateSql(req,res)
})
router.post('/updateTask',(req,res)=>{
	console.log('-------------------更新任务信息----------------')
	task.updateInfo(req,res)
})

router.post('/sendTask',(req,res)=>{
	let obj = req.body
	if(!obj.taskId||!obj.staffs||obj.staffs.length<=0){
		console.log('----------------派发任务参数错误---------------')
		res.json({msg:'派发错误,参数不能为空',success:false})
		return;
	}
	task.refreshIsSend(req.body,res)
})

router.post('/getTaskList',(req,res)=>{
	task.queryTaskByTimeWithInfo(req.body,res)
})


router.post('/deleteTask',(req,res)=>{
	if(!req.body||req.body.taskId==''){
		res.json({success:false,msg:'删除失败,参数不正确'})
		return;
	}
	task.deleteTask(req.body.taskId,res)
})
module.exports = router