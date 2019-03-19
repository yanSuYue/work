const http = require('http');  
const qs = require('querystring');
const express = require('express')
const router = express.Router()

const excel = require('../sql/excel.js')

router.post('/getExcelTask',(req,res)=>{
	try{
		excel.get_excel_task_list(req,res)
	}catch(e){
		console.log(e)
		res.json({success:false,err:e,note:'SERVER ERR',count:0,lists:[]})
	}
})

router.post('/excelUpload',(req,res)=>{
	try{
		excel.excel_upload(req,res)
	}catch(e){
		res.json({success:false,err:e,note:'SERVER ERR'})
		console.log(e)
	}
})

router.post('/docUpload',(req,res)=>{
	try{
		excel.doc_upload(req,res)
	}catch(e){
		res.json({success:false,err:e,note:'SERVER ERR'})
	}
})

router.post('/allDoc',(req,res)=>{
	try{
		excel.get_all_doc(req,res)
	}catch(e){
		res.json({err:e,count:0,lists:[],msg:'SERVER ERR'})
	}
})
router.post('/censusUrls',(req,res)=>{
	restart(req,res)
})
//downpack
router.post('/downpack',(req,res)=>{
	excel.downpack(req,res)
})
function restart(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            type:req.body.type
        };//这是需要提交的数据  
        if(req.body.district){
			data.genre=2
			data.id=req.body.district
		}else if(req.body.city){
			data.genre=1
			data.id=req.body.city
		}else{
			data.genre=0
			data.id=req.body.provinceId
		}
        
        let content = qs.stringify(data); 
        
        console.log(content,'contenttttttttttttttttttttttt')
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_TASKAction!generate_fc_docx?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {
			res2.json(chunk)  
              resolve(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}
module.exports=router