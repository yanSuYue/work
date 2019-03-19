const express = require('express')
const router = express.Router()
const device = require('../controller/sql/device.js')


router.post('/devices',(req,res)=>{
	device.queryAllDeviceType(req.body.type,res)
})
router.post('/getdevices',(req,res)=>{
	device.getdevices(req.body,res)
})
//addDevices
router.post('/addDevices',(req,res)=>{
	device.addDevices(req,res)
})
//deldevices
router.post('/deldevices',(req,res)=>{
	device.deldevices(req,res)
})
//addDeviceAuth
router.post('/addDeviceAuth',(req,res)=>{
	device.addDeviceAuth(req,res)
})
//delDevicePower
router.post('/delDevicePower',(req,res)=>{
	device.delDevicePower(req.body.id,res)
})
//updateDevice
router.post('/updateDevice',(req,res)=>{
	device.updateDevice(req,res)
})
//addmanage
router.post('/addmanage',(req,res)=>{
	device.addmanage(req,res)
})
//getimages
router.post('/getimages',(req,res)=>{
	device.getimages(req,res)
})
//getimages
router.post('/getallimages',(req,res)=>{
	device.getallimages(req,res)
})
//delmanage
router.post('/delmanage',(req,res)=>{
	device.delmanage(req.body.id,res)
})
//updatemanage
router.post('/updatemanage',(req,res)=>{
	device.updatemanage(req.body,res)
})
//updataimgidupdataimgid
router.post('/updataimgid',(req,res)=>{
	device.updataimgid(req.body,res)
})
module.exports = router