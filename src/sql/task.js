const http = require('http');  
const qs = require('querystring');
const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const company = require('./company.js')
const area = require('./area.js')
const makeExcel = require('./export-excel')


const log = require('../server/log.js')



const project = require('./project.js')
async function get_home_task_list(req, res) {
    let sql = `SELECT MON.moncompanyName,PRO.type FROM ROMS202_TASK TA JOIN ROMS202_PROJECT PRO ON
	TA.projectId = PRO.id JOIN ROMS202_MONCOMPANY MON ON MON.id = PRO.moncompanyId ORDER BY TA.createtime DESC  LIMIT 0,5`
    let tasks = await db.raw_select(sql, [])
    res.json({ tasks: tasks.result })
}
async function get_task_list(req,res) {
    let pageIndex = req.body.params.pageIndex
    let pageSize = req.body.params.pageSize
    let pageStart


    //let type = req.body.params.type || ''  // 任务审核 无此字段，初测为0，详查为1
    let comname = req.body.params.comname || '' //企业名称
    let speciesType = req.body.params.speciesType || '' //矿产种类
    let companyCode = req.body.params.code || '' //企业识别码
    let companyType = req.body.params.comtype || '' //企业类型
    let controlType = req.body.params.controlType || 0 //质控类型
    let ceType = req.body.params.ceType  //类型选择 初测0详查1
    let districtId = req.body.params.district || '' //地区选择
    let stationId = req.body.params.commonstation || '' //监测站
    let uranium238 = req.body.params.uranium228 || 0
    let thorium232 = req.body.params.thorium232 || 0
    let radium226 = req.body.params.radium226 || 0 //固体
    let totalThorium = req.body.params.totalThorium || 0
    let totalUranium = req.body.params.totalUranium || 0
    let waterTotalThorium = req.body.params.waterTotalThorium || 0
    let totalAlpha = req.body.params.totalAlpha || 0
    let totalBeta = req.body.params.totalBeta || 0
    let waterRadium226 = req.body.params.wateRradium226 || 0

    let pass = req.body.params.pass //任务审核页面0，结合isover字段，初测页面=2，详查页面=2
    let complete = req.body.params.complete

    let monstationName = req.body.params.name


    let species = req.body.params.species || ''
    let result = req.body.params.result || 0



    let pageEnd
    if (pageSize <= 0) {
        pageStart = 0
        pageEnd = pageSize
    } else {
        pageStart = Number(pageIndex) * Number(pageSize)
        pageEnd = pageSize
    }
    let count
    let admin = req.session.admin
    let monstationId = req.session.monstationId
    let type2 = req.session.type
    let provinceId = req.session.provinceId
    let s = "1=1 ";
    let s_task = " 1=1 ";
    let s_taskpoint = " 1=1 ";

    if (comname.length > 0) {
        s += ` and company.moncompanyName like '%${comname}%' `;
    }
    if (speciesType.length > 0) {
        s += ` and company.mineralSpecies like '%${speciesType}%' `;
    }
    if (companyCode.length > 0) {
        s += ` and project.companyCode like '%${companyCode}%' `;
    }
    if (companyType.length > 0) {
        s += ` and project.companyType = '${companyType}' `;
    }

    if (controlType > 0) {
        s += ` and task.controlType=${controlType} `;
    }
    
	 if (ceType.length!=0) 
	 {
   	 	s += ` and project.type=${ceType} `;
	 }
 	

   
   
    if (districtId.length > 0) {
        s += ` and district.id = '${districtId}' `;
    }
  /*  //如果监测单位里有值，--------------------------------------------------------------------
    if(monstationId.length > 0){
    	s += ` and commonstation.id = '${monstationId}' `;
    }else{
    	s += ` and commonstation.id = '' `
    }
    //-------------------------------------------------------------------------------------
	//监测单位登陆进来*/
    if (monstationId) {
    	//监测单位登陆进来
        if(type2==4||req.type2==5||type2==6){
            s += ` and project.libstationId='${monstationId}'`
        }else{
        	//if(stationId.length>0)
            	s += ` and project.monstationId='${monstationId}' `
            	//s += ` and project.monstationId='${stationId}' `
        }
    }
    else
    {
    	//管理员登陆进来
    	//监测单位登陆进来
    	if(stationId.length>0)
    	s += ` and project.monstationId='${stationId}' `
    }
    
    if(provinceId){
        s+=`AND company.provinceId='${provinceId}'`
    }

    //固定样
    let gty = '';

    let gty_taskpoint = '';
    if (uranium238 > 0 || thorium232 > 0 || radium226 > 0 || totalThorium > 0) {
        gty += ` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid and tp.type = 4  `
        gty_taskpoint += ` SELECT DISTINCT tp.id  FROM ROMS202_TASKPOINT tp WHERE  tp.type = 4  `
        if (uranium238 > 0) {
            gty += ` and tp.uranium238 is not null and  CAST( tp.uranium238  AS DECIMAL(9,2)) >  ${uranium238} `;
            gty_taskpoint += ` and tp.uranium238 is not null and  CAST( tp.uranium238  AS DECIMAL(9,2)) >  ${uranium238} `;
        }


        if (thorium232 > 0) {
            gty += ` and tp.thorium232 is not null and  CAST( tp.thorium232  AS DECIMAL(9,2)) >  ${thorium232} `;
            gty_taskpoint += ` and tp.thorium232 is not null and  CAST( tp.thorium232  AS DECIMAL(9,2)) >  ${thorium232} `;
        }


        if (radium226 > 0) {
            gty += ` and tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${radium226} `;
            gty_taskpoint += ` and tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${radium226} `;
        }

        if (totalThorium > 0) {
            gty += ` and tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${totalThorium} `;
            gty_taskpoint += ` and tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${totalThorium} `;
        }

    }

    //水样
    let sy = '';
    let sy_taskpoint = '';
    if (totalUranium > 0 || waterTotalThorium > 0 || totalAlpha > 0 || totalBeta > 0 || waterRadium226 > 0) {
        sy += ` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid and tp.type = 3  `
        sy_taskpoint += ` SELECT DISTINCT tp.id  FROM  ROMS202_TASKPOINT tp WHERE   tp.type = 3  `
        if (totalUranium > 0) {
            sy += ` and tp.totalUranium is not null and  CAST( tp.totalUranium  AS DECIMAL(9,2)) >  ${totalUranium} `;
            sy_taskpoint += ` and tp.totalUranium is not null and  CAST( tp.totalUranium  AS DECIMAL(9,2)) >  ${totalUranium} `;
        }

        if (waterTotalThorium > 0) {
            sy += ` and  tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${waterTotalThorium} `;
            sy_taskpoint += ` and  tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${waterTotalThorium} `;
        }

        if (totalAlpha > 0) {
            sy += ` and tp.radium226 is not null and CAST( tp.totalAlpha  AS DECIMAL(9,2)) >  ${totalAlpha} `;
            sy_taskpoint += ` and tp.radium226 is not null and CAST( tp.totalAlpha  AS DECIMAL(9,2)) >  ${totalAlpha} `;
        }
        if (totalBeta > 0) {
            sy += ` and tp.totalBeta is not null and  CAST( tp.totalBeta  AS DECIMAL(9,2)) >  ${totalBeta} `;
            sy_taskpoint += ` and tp.totalBeta is not null and  CAST( tp.totalBeta  AS DECIMAL(9,2)) >  ${totalBeta} `;
        }
        //waterRadium226
        if (waterRadium226 > 0) {
            sy += ` and  tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${waterRadium226} `;
            sy_taskpoint += ` and  tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${waterRadium226} `;
        }


    }


    //剂量率
    let jlv = '';
    let jlv_taskpoint = '';
    if (result > 0) {
        if (controlType == 0) {
            jlv += ` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid  AND 
                ((tp.type = 0 || tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
            jlv_taskpoint += ` SELECT DISTINCT tp.id  FROM ROMS202_TASKPOINT tp WHERE    
                ((tp.type = 0 || tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
        } else {
            jlv += ` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid  AND 
                (( tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
            jlv_taskpoint += ` SELECT DISTINCT tp.id  FROM ROMS202_TASKPOINT tp WHERE 
                (( tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
        }


        // jlv+=`     taskpoint.result is not null and CAST( taskpoint.result  AS DECIMAL(9,2)) >  ${result} `;
        // jlv+=`) `
    }

    //s_task = s;
    s_taskpoint = s;

    //剂量率 001
    if (gty.length == 0 && sy.length == 0 && jlv.length > 0) {

        s += ` and  project.id IN ( SELECT id FROM ( ${jlv} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${jlv_taskpoint} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;


    }

    //水样 010
    if (gty.length == 0 && sy.length > 0 && jlv.length == 0) {
        s += ` and  project.id IN ( SELECT id FROM ( ${sy} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${sy_taskpoint} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;

    }

    //  011
    if (gty.length == 0 && sy.length > 0 && jlv.length > 0) {

        s += ` and  project.id IN ( SELECT id FROM ( ${jlv}  union all   ${sy}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${jlv_taskpoint}  union all   ${sy_taskpoint}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
    }

    //固体样  100
    if (gty.length > 0 && sy.length == 0 && jlv.length == 0) {
        s += ` and  project.id IN ( SELECT id FROM ( ${gty} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${gty_taskpoint} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
    }

    //固体样+jlv  101
    if (gty.length > 0 && sy.length == 0 && jlv.length > 0) {
        s += ` and  project.id IN ( SELECT id FROM ( ${jlv}  union all   ${gty}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${jlv_taskpoint}  union all   ${gty_taskpoint}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
    }

    //gty + 水样 110
    if (gty.length > 0 && sy.length > 0 && jlv.length == 0) {
        s += ` and  project.id IN ( SELECT id FROM ( ${sy}  union all   ${gty}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
        s_taskpoint += ` and  taskpoint.id IN ( SELECT id FROM ( ${sy_taskpoint}  union all   ${gty_taskpoint}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
    }

    //111
    if (gty.length > 0 && sy.length > 0 && jlv.length > 0) {
        s += ` and  project.id IN ( SELECT id FROM ( ${sy}  union all   ${gty}  union all   ${jlv}  ) aaa  GROUP BY id HAVING COUNT(*) > 2) `;
        s_taskpoint += ` and  project.id IN ( SELECT id FROM ( ${sy_taskpoint}  union all   ${gty_taskpoint}  union all   ${jlv_taskpoint}  ) aaa  GROUP BY id HAVING COUNT(*) > 2) `;
    }
	//pass = 0 未审核，1审核不通过，2 审核通过
	
    let endsql = ` task.pass = 0 OR task.pass= 1 ` //任务审核
    if (pass == 2) 
    {
        endsql = ` task.pass = 2 `//初测或详查
    }
    //let kind2 = ``
    //company.provinceId='${provinceId}' AND
    //company.provinceId='${provinceId}' AND
    if (true) 
    {
        
        let pro_sql = `SELECT DISTINCT company.moncompanyname, project.* FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE
      
        project.moncompanyid = company.id AND
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id
        AND ${s}  
        AND ((${endsql}))
        ORDER BY project.createtime DESC LIMIT ${pageStart},${pageEnd}`
        log.info("pro_sql="+pro_sql)
        
        //导出企业表有用
        let company_sql = `SELECT DISTINCT city.cityName,project.companyCode,company.moncompanyName,company.mineralSpecies,project.companyType,project.address,project.contact,project.phone FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_CITY city,
        ROMS202_DISTRICT district
        WHERE
      
        project.moncompanyid = company.id AND
        city.id=district.cityId AND
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id
        AND ${s}  
        AND ((${endsql}))
        ORDER BY project.createtime DESC `
        log.info("company_sql="+company_sql)

        let task_sql = `SELECT DISTINCT task.id FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE
      
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id
        AND ${s_taskpoint}  
        AND ((${endsql}))`

        log.info("task_sql="+task_sql)

        let taskpoint_sql = `SELECT DISTINCT taskpoint.type,count(*) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE
        
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id 
        AND ${s_taskpoint}  
        AND ((${endsql})) group by taskpoint.type`

        log.info("taskpoint_sql="+taskpoint_sql)
		
        let taskpoint_data = `
        SELECT DISTINCT 
        taskpoint.type,
        taskpoint.lng,taskpoint.lat,taskpoint.result,
        taskpoint.depict,taskpoint.object,taskpoint.pointNum,taskpoint.sampleName,
        taskpoint.uranium238,taskpoint.radium226,taskpoint.totalThorium,
        taskpoint.totalUranium,taskpoint.totalAlpha,taskpoint.totalBeta,taskpoint.radium226,
        project.companyType,project.note,
        project.address,project.companyCode,project.contact,project.phone,project.lat,project.lng,
        company.mineralSpecies,taskpoint.avg,taskpoint.result,taskpoint.createtime,
        company.moncompanyName as companyName ,province.provinceName,city.cityName,
        district.districtName as local FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district,
        ROMS202_CITY city,
        ROMS202_PROVINCE province
        WHERE
      
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id AND
        district.cityId = city.id AND 
        city.provinceId = province.id
        AND ${s_taskpoint}  
        AND ((${endsql}))
    	`
        
        log.info("taskpoint_data="+taskpoint_data)
        
        let __sql = `SELECT COUNT(distinct project.id) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE 
          
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
          task.monstationid = station.id AND 
          company.districtid = district.id
          AND ${s}  
          AND (${endsql})`


        let tj_sql = `SELECT DISTINCT company.moncompanyname, project.* FROM  
          ROMS202_MONCOMPANY company , 
          ROMS202_PROJECT project ,
          ROMS202_TASK task,
          ROMS202_TASKPOINT taskpoint ,
          ROMS202_MONSTATION station,
          ROMS202_DISTRICT district
          WHERE
         
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
          task.monstationid = station.id AND 
          company.districtid = district.id 
          AND ${s}  
          AND ((${endsql}))
          ORDER BY project.createtime DESC`
        let proInfo = await db.raw_select(pro_sql, [])
        let list = proInfo.result.map(async(i) => {
            let tasks = await getTasks(type2,i.id, pass)
            let companys = await getCompanys(i.moncompanyId)
            let district = await getDistrict(i.moncompanyId)
            let monstationName = await getMonstation(i.monstationId)
            i.tasks = tasks.result;
            i.district = district.result[0].districtName
            i.monstationName = monstationName.result[0].monstationName
            i.name = companys.result[0].moncompanyName
            i.companyType = companys.result[0].mineralSpecies
            return i
        })

        let chucesql = `SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=0 `
        let xiangchasql = `SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=1 `

        let chucesql1 = `SELECT COUNT(*) as count FROM (${tj_sql}) aaa where type=0 `
        let xiangchasql1 = `SELECT COUNT(*) as count FROM (${tj_sql}) aaa  where type=1 `

		
        let chucesql2 = await db.raw_select(chucesql1, [])
        let xiangchasql2 = await db.raw_select(xiangchasql1, [])
        let _count_obj = await db.raw_select(__sql, [])
        let _count_xiangcha = await db.raw_select(xiangchasql, [])
        let _count_chuce = await db.raw_select(chucesql, [])

        //joker 20171104修改
        let sy_num = 0,
            gt_num = 0,
            xy_num = 0;
        let _count_taskpoint = await db.raw_select(taskpoint_sql, [])
        
        if (_count_taskpoint.success) {
            _count_taskpoint.result.forEach((item) => {
                switch (item.type) {
                    case 0:
                    case 5:
                        xy_num += item.count
                        break;
                    case 3:
                    case 1:
                    case 6:
                        sy_num += item.count
                        break;
                    case 2:
                    case 7:
                    case 4:
                        gt_num += item.count
                        break;
                }
            })
        }
        let showData = `
        初测企业共${_count_chuce.result[0].count}家，详查企业共${_count_xiangcha.result[0].count}家,其中符合搜索条件的初测企业有${chucesql2.result[0].count}家，
        详查企业有${xiangchasql2.result[0].count}家(满足条件的固体样测点数${gt_num}个，水样测点数${sy_num}个，X-γ剂量率测点数${xy_num}个)`
        //joker 1104添加
        log.info("taskpoint_data....."+taskpoint_data);
      
        let dd5;
        if(req.body.params.done){
        	
        	let taskpoint_excel = await db.raw_select(taskpoint_data,[])
        	let compamy_excel = await db.raw_select(company_sql,[])
        	//&&taskpoint_excel.success
            let data = taskpoint_excel.result;
            log.info("length="+data.length);
            let val1 = [];
            let val2 = [];
            let val3 = [];
            let val4 = [];
            for(let i=0;i<data.length;i++)
            {
                if(data[i].type==0||data[i].type==5)
                {
                	//generate_the_y_docx
                	let obj1 = {
                    item1:data[i].cityName||'',
                    item2:data[i].companyCode||'',
                    item3:data[i].companyName||'',
                    item4:data[i].pointNum||'',
                    item5:data[i].object||'',
                    item6:data[i].depict||'',
                    item7:data[i].result||''
                	};
                 	val1.push(obj1)
                }
                if(data[i].type==4||data[i].type==2||data[i].type==7)
                {
	                let obj2 = {
	                	//generate_the_gt_y_docx
	                    item1:data[i].cityName||'',
	                    item2:data[i].companyCode||'',
	                    item3:data[i].companyName||'',
	                    item4:data[i].pointNum||'',
	                    item5:data[i].sampleName||'',
	                    item6:data[i].uranium238||'',
	                    item7:data[i].thorium232||'',
	                    item8:data[i].radium226||'',
	                    item9:data[i].totalThorium||''
	                };
	                val2.push(obj2)
                }
                if(data[i].type==1||data[i].type==3||data[i].type==6)
                {
                	let obj3 = {
                	//generate_the_sy_y_docx
                    item1:data[i].cityName||'',
                    item2:data[i].companyCode||'',
                    item3:data[i].companyName||'',
                    item4:data[i].pointNum||'',
                    item5:data[i].totalUranium||'',
                    item6:data[i].totalThorium||'',
                    item7:data[i].radium226||'',
                    item8:data[i].totalAlpha||'',
                    item9:data[i].totalBeta||''
               		 };
               		 val3.push(obj3)
                }
                
            }
            data = compamy_excel.result;
             for(let i=0;i<data.length;i++)
            {
                
                let obj4 = {
                    item1:data[i].cityName||'',
                    item2:data[i].companyCode||'',
                    item3:data[i].moncompanyName||'',
                    item4:data[i].mineralSpecies||'',
                    item5:data[i].companyType||'',
                    item6:data[i].address||'',
                    item7:data[i].contact||'',
                    item8:data[i].phone||''
                };
               
                val4.push(obj4)
                
            }
			log.info("val1.length="+val1.length);
			log.info("val2.length="+val2.length);
			log.info("val3.length="+val3.length);
			log.info("val4.length="+val4.length);
			
			
            let dd1 = await getdoc1(val1,res)
            let dd2 = await getdoc2(val2,res)
            let dd3 = await getdoc3(val3,res)
            let dd4 = await getdoc4(val4,res)
            dd5 = await getdoc5(res)
        }  
        Promise.all(list)
            .then(r => { res.json({ dd5:dd5,lists: r, count: _count_obj.result[0].count, showData }); })
            .catch(e => {
                res.json({ lists: [], count: 0 })
            })
        
    }

}

function getdoc1(val,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let vals=[{name:123,age:4}]
        let data = {  
            data:JSON.stringify(val)
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        //console.log(content)
        let options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(content)
            },  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!generate_the_y_docx',
            method: 'post'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
          res.on('end', (e) => {
            console.log(e);
          });
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        req2.write(content);
        req2.end();
    })
}
 
function getdoc2(val,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let vals=[{name:123,age:4}]
        let data = {  
            data:JSON.stringify(val)
        };//这是需要提交的数据  
        
        let content = qs.stringify(data); 
        //console.log(content)
        let options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(content)
            },  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!generate_the_gt_y_docx',  
            method: 'post'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
          res.on('end', (e) => {
            console.log(e);
          });
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        req2.write(content);
        req2.end();
    })
}

function getdoc3(val,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let vals=[{name:123,age:4}]
        let data = {  
            data:JSON.stringify(val)
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        //console.log(content)
        let options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(content)
            },  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!generate_the_sy_y_docx',  
            method: 'post'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
          res.on('end', (e) => {
            console.log(e);
          });
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        req2.write(content);
        req2.end();
    })
}

function getdoc4(val,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let vals=[{name:123,age:4}]
        let data = {  
            data:JSON.stringify(val)
        };//这是需要提交的数据  
        //let data = {  
        //    data:val
        //};//这是需要提交的数据  
        //let data = "\"data\"="+JSON.stringify(val);
        //data=JSON.stringify(data)
        //log.info(data);
        
        let content = qs.stringify(data); 
        log.info("content=");
        //log.info(content);
        //console.log(content)
        let options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(content)
            },  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!generate_the_xcCompany_docx',  
            method: 'post'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
          res.on('end', (e) => {
            console.log(e);
          });
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        req2.write(content);
        req2.end();
    })
}


function getdoc5(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!theZip',  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            reject(e) 
        });  
        
        req2.end();
    })
}


function restart(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            taskId:req.body.id
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_TASKAction!app_generate_y_docx?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              resolve(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}


function restart2(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            projectId:req.body.projectId2
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_PROJECTAction!app_generate_docx?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              res2.json(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}


function restartall(req,res){
    return new Promise((resolve,reject)=>{
        let res2=res;
        let data = {  
            taskId:req.body.id
        };//这是需要提交的数据  
        
        
        let content = qs.stringify(data); 
        
        
        let options = {  
            hostname: '127.0.0.1',  
            port: 8080,  
            path: '/roms/Json/ROMS202_TASKAction!app_generateTask_docx?' + content,  
            method: 'GET'  
        };  
        
        var req2 = http.request(options, function (res) {  
          res.setEncoding('utf8');  
          res.on('data', function (chunk) {  
              res2.json(chunk)  
          });  
        });  
        
        req2.on('error', function (e) {  
            res2.json(e) 
        });  
        
        req2.end();
    })
}


async function isexist(req,res){
    let sql = `select * from ROMS202_TASK where (type=3 or type=4 or type=0) AND (pass=0 OR pass=1) AND projectId='${req.body.projectId2}'`
    let back = await db.raw_select(sql,[])
    return back.result.length;
}

async function pass_doc2(req, res) {
    let docId = req.body.id
    let flag = req.body.flag
    let pass = req.body.pass
    if (!docId || !pass) {
        res.json({ success: false, msg: '参数不能为空' })
        return
    } else {
        let _keys = {
            pass: pass,
            checkUrl:req.session.photoUrl
        }
        let _filter = {
            id: docId
        }

        let back = await db.update(['ROMS202_TASK', _keys, _filter])
        // if(req.body.type==3||req.body.type==4){
        //     await restart(req,res)
        // }else{
            
        // }
        await restartall(req,res)
        let countd=await isexist(req,res)
        if(countd){
            res.json("{'success':true,'msg':'更新成功','tip':'未调用'")
        }else{
            await restart2(req,res)
        }
            //let updateFlag = await updateProFlag(docId)
    }
}


async function pass_doc(req, res) {
    console.log(req.body,'777777777777777777777')
    let docId = req.body.id
    let flag = req.body.flag
    let pass = req.body.pass
    let twoCheckUrl = req.session.photoUrl

    if (!docId || !pass) {
        res.json({ success: false, msg: '参数不能为空' })
        return
    } else {
        let _keys = {
            pass: pass,
            twoCheckUrl:twoCheckUrl
        }
        let _filter = {
            id: docId
        }
        let back = await db.update(['ROMS202_TASK', _keys, _filter])
            //let updateFlag = await updateProFlag(docId)
            await restartall(req,res)
        if (back.affected) {
            res.json("{'success':true,'msg':'更新成功'}")
        } else {
            res.json("{'success':false,'msg':'更新失败'}")
        }
    }
}

async function updateProFlag(id) {
    let sql = `update ROMS202_PROJECT set flag=1 where taskId='${id}'`
    let back = await db.raw_select(_sql, [])
}


async function get_single_task(req, res) {
    if (!req.body.companyCode) {
        res.json({ success: false, msg: '缺少参数' })
        return
    } else {
        let companyCode = req.body.companyCode
        let likeStr = companyCode + '%'
        let _sql = `select 
		t.id,t.type,t.projectId,t.measureDataPdfUrl,t.measureDataUrl,t.pass,t.excelUrl,
		p.moncompanyId,p.companyUrl,p.companyCode code,p.type test_type,
		c.moncompanyName name,c.districtId,c.mineralSpecies,
		d.districtName district
		from ROMS202_TASK t 
		inner join ROMS202_PROJECT p 
		on t.projectId = p.id  
		inner join ROMS202_MONCOMPANY c
		on p.moncompanyId = c.id
		inner join ROMS202_DISTRICT d
		on c.districtId = d.id
		where p.companyCode like ?
		`
        let back = await db.raw_select(_sql, [likeStr])

        if (back.success) {
            res.json({ success: true, lists: back.result, count: back.count })
        } else {
            res.json({ success: false, lists: [], count: 0 })
        }
    }
}

async function getTasks(type,id, pass) {
    let str=``
    if(type==4||type==5||type==6){
       str+=`(a.type=3 or a.type=4) AND`
    }
    let _sql = `SELECT a.*,monuserName from ROMS202_TASK a, ROMS202_MONUSER b where ${str} a.monuserid=b.id and projectId='${id}'`
    if (pass == 2) {
        _sql = `SELECT a.*,monuserName from ROMS202_TASK a, ROMS202_MONUSER b where ${str} a.pass=2 AND a.monuserid=b.id and projectId='${id}'`
    }
    let back = await db.raw_select(_sql, [])

    return back
}

async function getCompanys(id) {
    let _sql = `SELECT * from ROMS202_MONCOMPANY  where id='${id}'`
    let back = await db.raw_select(_sql, [])
    return back
}

async function monstationName(id) {
    let _sql = `SELECT * from ROMS202_MONCOMPANY  where id='${id}'`
    let back = await db.raw_select(_sql, [])
    return back
}

async function getDistrict(id) {
    let _sql = `SELECT DIS.* from ROMS202_MONCOMPANY MON join ROMS202_DISTRICT DIS on MON.districtId=DIS.id where MON.id='${id}'`
    let back = await db.raw_select(_sql, [])
    return back
}

async function getMonstation(id) {
    let _sql = `SELECT * from ROMS202_MONSTATION where id='${id}'`
    let back = await db.raw_select(_sql, [])
    return back
}

async function getcensusUrl(start,end,keyword){
    let str=`where pro.censusUrl is NOT NULL `
    if(keyword!==''){
        str+=` AND com.moncompanyName like '%${keyword}%'`
    }
    let sql = `select com.moncompanyName, pro.* from ROMS202_PROJECT pro join ROMS202_MONCOMPANY com on pro.moncompanyId=com.id ${str} limit ${start},${end}`
    let back = await db.raw_select(sql,[])
    return(back)
}

async function getcountUrl(keyword){
    let str=`where pro.censusUrl is NOT NULL `
    if(keyword!==''){
        str+=` AND com.moncompanyName like '%${keyword}%'`
    }
    let sql = `select count(*) as count  from ROMS202_PROJECT pro join ROMS202_MONCOMPANY com on pro.moncompanyId=com.id ${str}`

    let back = await db.raw_select(sql,[])
    return(back)
}

async function censusUrl(req,res){
    let pageSize = req.body.pageSize
    let keyword = req.body.keyword
    let nowPage = req.body.pageIndex
    let start = pageSize*nowPage;
    let list = await getcensusUrl(start,pageSize,keyword)
    let count = await getcountUrl(keyword)
    res.json({list,count})
}



const task = {
    get_home_task_list: get_home_task_list,
    get_task_list: get_task_list,
    pass_doc: pass_doc,
    pass_doc2: pass_doc2,
    get_single_task: get_single_task,
    censusUrl: censusUrl
}

module.exports = task