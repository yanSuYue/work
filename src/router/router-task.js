const express = require('express')
const router = express.Router()

const task = require('../sql/task.js')
//const doc = require('../sql/doc.js')

router.post('/getTask',(req,res)=>{

	try{
		console.log('get task')
		task.get_task_list(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER_ERR'})
	}
})

//censusUrl
router.post('/censusUrl',(req,res)=>{
	try{
		task.censusUrl(req,res)
	}catch(e){
		res.status(500)
		res.json({err:'SERVER_ERR'})
	}
})

router.post('/gethomeTask',(req,res)=>{
	try{
		console.log('get hometask')
		task.get_home_task_list(req,res)
	}catch(e){
		console.log(e)
		res.status(500)
		res.json({err:'SERVER_ERR'})
	}
})

router.post('/passDoc',(req,res)=>{
	try{
		if(req.body.type==0||req.body.type==3||req.body.type==4){
			task.pass_doc2(req,res)
		}else{
			task.pass_doc(req,res)
		}
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR',err:e})
	}
})

/*添加模糊查询任务*/
router.post('/singleTask',(req,res)=>{
	try{
		task.get_single_task(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,msg:'SERVER ERR'})
	}
})

module.exports = router