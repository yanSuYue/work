const express = require('express')
const router = express.Router()
const usr = require('../controller/sql/usr.js')



// 查询所有staffs
router.post('/staffs',(req,res)=>{
	usr.queryAllUsers(req,res)
})
//公共卫生
router.post('/getcommonOptions',(req,res)=>{
	usr.getcommonOptions(req,res)
})
//环境卫生
router.post('/getaroundOptions',(req,res)=>{
	usr.getaroundOptions(req,res)
})
//工业放射
router.post('/getindustry',(req,res)=>{
	usr.getindustry(req,res)
})
//医用放射（防护）
router.post('/getmedicalOptiions',(req,res)=>{
	usr.getmedicalOptiions(req,res)
})
//医用放射（性能）
router.post('/getmedicalOptiions2',(req,res)=>{

	usr.getmedicalOptiions2(req,res)
})
//getRoleOptions
router.post('/getRoleOptions',(req,res)=>{
	usr.getRoleOptions(req,res)
})
//powerOptions
router.post('/getpowerOptions',(req,res)=>{
	usr.getpowerOptions(req,res)
})
//addStaffType
router.post('/addStaffType',(req,res)=>{
	usr.addStaffType(req,res)
})
//getdeviceTypeOptions
router.post('/getdeviceTypeOptions',(req,res)=>{
	usr.getdeviceTypeOptions(req,res)
})
//查询某个staff的相关信息
router.post('/staff',(req,res)=>{
	usr.querySingleUser(req.body.id,res)
})

router.post('/taskStaff',(req,res)=>{
	usr.filterStaff(req.body.subCompanyId,req.body.deviceTypeArr,res,req.body.taskid)
})
router.post('/addStaff',(req,res)=>{
	console.log(req.body)
	usr.addUser(req.body,res)
})

router.post('/deleteStaff',(req,res)=>{
	if(!req.body.id){
		res.json({success:false,msg:'参数错误'})
	}
	usr.deleteUser(req.body.id,res).catch(e=>{
		res.json({e,message:'人员已绑定',success:false})
	})
})





router.post('/updateStaff',(req,res)=>{
	usr.updateUser(req.body,res)
})

module.exports = router

