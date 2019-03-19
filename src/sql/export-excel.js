const nodeExcel = require('excel-export');
const fs = require('fs')
const timeParser = require('easy-time-parser')
const timing = new timeParser()

function makeExcel(arr){
    let arr1
    arr1 = arr.map(item=>{
        let arr2 = []
        arr2.push(item.provinceName,item.cityName,item.local,item.companyName,item.avg,item.result,timing.format(item.createtime))
        return arr2
    })
    var conf ={};
	//conf.stylesXmlFile = "styles.xml";
    conf.name = "sheet1";
  	conf.cols = [
    {
        caption:'所属省份',
        type:'string',
    },
    {
        caption:'所属地级市',
        type:'string',
    },
    {
        caption:'所属地区',
        type:'string',
    },
    {
        caption:'企业名称',
        type:'string',
        width:200
    },
    {
        caption:'平均值',
        type:'number',
    },
    {
		caption:'结果值',
        type:'number',
	},{
		caption:'测量时间',
        type:'string',
        width:150
	}];
  	// conf.rows = [
 	// 	['test1', 123, true, 3.14],
 	// 	["test2", 123, false, 2.7182],
    //     ["test3", 123, false, 1.61803],
    //     ["test4", 123, true, 1.414]  
      // ];
      conf.rows = arr1
	  var result = nodeExcel.execute(conf);
	  fs.writeFile('/node_server/lyy/bsk/src/search/result.xlsx',result,'binary',(err)=>{
		  if(err)throw err
		  console.log('写入成功')
	  })
}


function makeExcelCompany(arr){
    let arr1
    arr1 = arr.map(item=>{
        let arr2 = []
        arr2.push(
            item.provinceName,item.cityName,item.local,
            item.address,item.companyCode,item.companyName,
            item.mineralSpecies,item.companyType,
            item.note,item.contact,
            item.phone,item.lng,item.lat
           )
        return arr2
    })
    var conf ={};
	//conf.stylesXmlFile = "styles.xml";
    conf.name = "sheet1";
  	conf.cols = [
    {
        caption:'省',
        type:'string',
    },
    {
        caption:'市',
        type:'string',
    },
    {
        caption:'区',
        type:'string',
    },
    {
        caption:'企业地址',
        type:'string',
        width:200
    },
    {
        caption:'单位识别码',
        type:'string'
    },
    {
        caption:'企业名称',
        type:'string'
    },
    {
        caption:'矿产种类',
        type:'string',
    },
    {
		caption:'企业信息',
        type:'string',
	},{
		caption:'企业状态',
        type:'string',
    },
    {
        caption:'联系人',
        type:'string',
    },
    {
        caption:'联系电话',
        type:'string',
    },
    {
        caption:'企业GPS-经度',
        type:'string',
    },
    {
        caption:'企业GPS-纬度',
        type:'string',
    }
];
  	// conf.rows = [
 	// 	['test1', 123, true, 3.14],
 	// 	["test2", 123, false, 2.7182],
    //     ["test3", 123, false, 1.61803],
    //     ["test4", 123, true, 1.414]  
      // ];
      conf.rows = arr1
	  var result = nodeExcel.execute(conf);
	  fs.writeFile('/node_server/lyy/bsk/src/search/resultCompany.xlsx',result,'binary',(err)=>{
		  if(err)throw err
		  console.log('resultCompany写入成功')
	  })
}

exports.makeExcelCompany = makeExcelCompany

function makeExcelData(arr){
    console.log(arr[0])
    let arr1
    let rlng=rlat=glng=glat=slng=slat=stotalThorium=gtotalThorium=pointNum=totalAlpha=''
    arr1 = arr.map(item=>{
        item.pointNum?pointNum=item.pointNum:''
        item.totalAlpha=='null'?totalAlpha='':item.totalAlpha
        if(item.type==0||item.type==5){
            rlng = item.lng
            rlat = item.lat
        }else if(item.type==4){
            glng = item.lng
            glat = item.lat
            gtotalThorium = item.totalThorium
        }else if (item.type==3){
            slng = item.lng
            slat = item.lat
            stotalThorium = item.totalThorium
        }else{
            //donothing
        }
        let arr2 = []
        arr2.push(
            item.provinceName,item.cityName,item.local,
            item.companyName,item.companyCode,pointNum,
            rlng,rlat,item.result,
            glng,glat,item.uranium238,item.radium226,gtotalThorium,
            slng,slat,item.totalUranium,stotalThorium,totalAlpha,item.totalBeta,item.radium226,
           )
        return arr2
    })
    var conf ={};
	//conf.stylesXmlFile = "styles.xml";
    conf.name = "sheet1";
  	conf.cols = [
    {
        caption:'省',
        type:'string',
    },
    {
        caption:'市',
        type:'string',
    },
    {
        caption:'区',
        type:'string',
    },
    {
        caption:'企业名称',
        type:'string',
        width:200
    },
    {
        caption:'单位识别码',
        type:'string'
    },
    {
        caption:'测点编号',
        type:'string'
    },
    {
        caption:'γ-经度',
        type:'string',
    },
    {
		caption:'γ-纬度',
        type:'string',
    },
    {
		caption:'测量值',
        type:'string',
	},
    {
		caption:'固体样-经度',
        type:'string',
    },
    {
        caption:'固体样-纬度',
        type:'string',
    },
    {
        caption:'U-238',
        type:'string',
    },
    {
        caption:'Ra-226',
        type:'string',
    },
    {
        caption:'总钍',
        type:'string',
    },
    {
        caption:'水样-经度',
        type:'string',
    },
    {
        caption:'水样-纬度',
        type:'string',
    },
    {
        caption:'总U',
        type:'string',
    },
    {
        caption:'总Th',
        type:'string',
    },
    {
        caption:'总α',
        type:'string',
    },
    {
        caption:'总β',
        type:'string',
    },
    {
        caption:'Ra-226',
        type:'string',
    },
];
  	// conf.rows = [
 	// 	['test1', 123, true, 3.14],
 	// 	["test2", 123, false, 2.7182],
    //     ["test3", 123, false, 1.61803],
    //     ["test4", 123, true, 1.414]  
      // ];
      conf.rows = arr1
	  var result = nodeExcel.execute(conf);
	  fs.writeFile('/node_server/lyy/bsk/src/search/resultData.xlsx',result,'binary',(err)=>{
		  if(err)throw err
		  console.log('resultData写入成功')
	  })
}

exports.makeExcelData=makeExcelData