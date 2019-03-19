const express = require('express')
const router = express.Router()

const doc = require('../sql/doc.js')

router.post('/getDocPassed',(req,res)=>{
	try{
		doc.get_doc_pass_list(req,res)
	}catch(e){
		res.json({err:e})
		console.log(e)
	}
})

//downpack

router.post('/downpack',(req,res)=>{
	doc.downpack(req,res)
})
router.post('/censusUrls',(req,res)=>{
	restart()
})

function restart(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            type:req.body.type
            
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        
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
//censusUrl2