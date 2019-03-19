const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const area = require('./area.js')
const log = require('../server/log.js')
const makeExcel = require('./export-excel')

//查询企业编号是否已存在
async function has_this_num(num){
	let _sql = `select id,moncompanyNum from ROMS202_MONCOMPANY where moncompanyNum = ?`
	let back = await db.raw_select(_sql,[num])
	return back.success
}

//查询DEL表是否有过去被删除过的企业，如果有被删除的企业，则重新使用该号码
async function has_num_in_del(){
	let _sql = `select num from ROMS202_DEL order by num asc limit 1`
	let back = await db.raw_select(_sql,[])
	if(back.success){
		//如果该表有数据则返回该号码
		return {hasOldNum:true,num:back.result[0].num}
	}else{
		return {hasOldNum:false,num:''}
	}
}



//地图企业侧边栏
async function get_all_gps_project(req, res) {
	//log(req.url)

    let type = req.body.params.type || ''
    let comname = req.body.params.comname || '' //企业名称
    let speciesType = req.body.params.speciesType || '' //矿产种类
    let companyCode = req.body.params.code || '' //企业识别码
    let companyType = req.body.params.comtype || '' //企业类型
    let controlType = req.body.params.controlType || 0 //质控类型
    let ceType = req.body.params.ceType || 0 //类型选择 初测1详查2
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

    let pass = req.body.params.pass
    let complete = req.body.params.complete

    let monstationName = req.body.params.name


    let species = req.body.params.species || ''
    let result = req.body.params.result || 0


	let provinceId =req.body.params.provinceId

    let count
    let admin = req.session.admin
    let monstationId = req.session.stationId
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
    if (ceType == 1) {

        s += ` and project.type=0 `;
    }
    if (ceType == 2) {

        s += ` and project.type=1 `;
    }

    if (districtId.length > 0) {
        s += ` and district.id = '${districtId}' `;
    }

    if (stationId.length > 0) {
        s += ` and project.monstationId='${stationId}' `
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

    let endsql = ` task.pass = 0 OR task.pass= 1 or task.pass=2 `
    let kind2 = ``

    if (true) {
        if (pass == 2) {
            endsql = ` task.pass = 2 `
           // kind2 = ` project.type='${type}' AND `
        }
        let pro_sql = `SELECT DISTINCT company.id as comid,company.moncompanyname, project.* FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district,
        ROMS202_CITY city,
        ROMS202_PROVINCE province
        WHERE
        ${kind2}  
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id 
        AND city.id=district.cityid
        AND city.provinceId=province.id
        and province.id='${provinceId}'
        AND ${s}  
        AND ((${endsql}))
        ORDER BY project.createtime DESC`
        log.info(pro_sql)

        let task_sql = `SELECT DISTINCT task.id FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE
        ${kind2}  
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id 
        AND ${s_taskpoint}  
        AND ((${endsql}))`

        log.info(task_sql)

        let taskpoint_sql = `SELECT DISTINCT taskpoint.type,count(*) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district
        WHERE
        ${kind2}  
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id 
        AND ${s_taskpoint}  
        AND ((${endsql})) group by taskpoint.type`

        log.info(taskpoint_sql)

        let taskpoint_data = `
        SELECT DISTINCT taskpoint.*,company.moncompanyName as companyName ,province.provinceName,city.cityName,district.districtName as local FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district,
        ROMS202_CITY city,
        ROMS202_PROVINCE province
        WHERE
        ${kind2}  
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id AND
        district.cityId = city.id AND 
        city.provinceId = province.id AND
        province.id = '${provinceId}'  
        AND ${s_taskpoint}  
        AND ((${endsql}))
    `
        log.info(taskpoint_sql)
        
        let __sql = `SELECT COUNT(distinct project.id) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
        ROMS202_DISTRICT district,
        ROMS202_CITY city,
        ROMS202_PROVINCE province
        WHERE 
          ${kind2} 
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
           city.id=district.cityid
          AND city.provinceId=province.id AND
          task.monstationid = station.id AND 
           province.id='${provinceId}' AND
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
          ${kind2}  
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
            let taskpoint = await get_source_by_companyId(i.comid)
            let companys = await getCompanys(i.moncompanyId)
            let district = await getDistrict(i.moncompanyId)
            let monstationName = await getMonstation(i.monstationId)
            i.taskpoint=taskpoint
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
        详查企业有${xiangchasql2.result[0].count}家(其中满足条件的固体样测点数${gt_num}个，水样测点数${sy_num}个，X-γ剂量率测点数${xy_num}个)`
        //joker 1104添加
        let taskpoint_excel = await db.raw_select(taskpoint_data,[])
        
        if(taskpoint_excel.success){
            makeExcel.makeExcelCompany(taskpoint_excel.result)
            makeExcel.makeExcelData(taskpoint_excel.result)
        }  
        Promise.all(list)
            .then(r => { res.json({ taskpoint_excel:taskpoint_excel.result,lists: r, count: _count_obj.result[0].count, showData }); })
            .catch(e => {
                res.json({ lists: [], count: 0 })
            })
        
    } 

}
//////////////////////////////////////////////////////////////////////////////////////////////

async function getTasks(id, pass) {
    let _sql = `SELECT a.*,monuserName from ROMS202_TASK a, ROMS202_MONUSER b where a.monuserid=b.id and projectId='${id}'`
    if (pass == 2) {
        _sql = `SELECT a.*,monuserName from ROMS202_TASK a, ROMS202_MONUSER b where a.pass=2 AND a.monuserid=b.id and projectId='${id}'`
    }
    let back = await db.raw_select(_sql, [])

    return back
}

async function get_all_gps_project8(req,res){
	let pageIndex = req.body.params.pageIndex
	let pageSize = req.body.params.pageSize
    let pageStart
    

    let type = req.body.params.type || ''   
    let comname =req.body.params.comname || ''  //企业名称
    let speciesType = req.body.params.speciesType || '' //矿产种类
    let companyCode = req.body.params.code || '' //企业识别码
    let companyType = req.body.params.comtype || '' //企业类型
    let controlType = req.body.params.controlType || 0  //质控类型
    let ceType = req.body.params.ceType || 0  //类型选择 初测1详查2
    let districtId=req.body.params.district || '' //地区选择
    let stationId = req.body.params.commonstation || '' //监测站
	let uranium238 = req.body.params.uranium228 || 0
    let thorium232 = req.body.params.thorium232 || 0
    let radium226 = req.body.params.radium226 || 0//固体
    let totalThorium = req.body.params.totalThorium || 0
	let totalUranium = req.body.params.totalUranium || 0
	let waterTotalThorium = req.body.params.waterTotalThorium || 0
    let totalAlpha = req.body.params.totalAlpha || 0
	let totalBeta = req.body.params.totalBeta || 0
	let waterRadium226 = req.body.params.wateRradium226 || 0

	let pass = req.body.params.pass
	let complete = req.body.params.complete
	
	let monstationName = req.body.params.name
	
	
	let species = req.body.params.species || ''
	let result = req.body.params.result || 0


	let provinceId =req.body.params.provinceId
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd = pageSize
	}

	let count 
	let admin = req.session.admin
    let monstationId = req.session.stationId
	let s = "1=1 ";

        if(comname.length>0)
        {
            s+=` and company.moncompanyName like '%${comname}%' `;
        }
        if(speciesType.length>0)
        {
            s+=` and company.mineralSpecies like '%${speciesType}%' `;
        }
        if(companyCode.length>0)
        {
            s+=` and project.companyCode like '%${companyCode}%' `;
        }
        if(companyType.length>0)
        {
            s+=` and project.companyType = '${companyType}' `;
        }

		if(controlType>0){ 
			s+=` and task.controlType=${controlType}` ;
        }
        if(ceType==1){

			s+=` and project.type=0`;
        }
        if(ceType==2){
            
            s+=` and project.type=1`;
        }

        if(districtId.length>0)
        {
            s+=` and district.id = '${districtId}' `;
        }
         
        if(stationId.length>0){
            s+=` and project.monstationId='${stationId}' `
        }

        //固定样
        let gty = '';
        if(uranium238>0||thorium232>0||radium226>0||totalThorium>0)
        {
            gty+=` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid and tp.type = 4  `

            if(uranium238>0){
                gty+=` and tp.uranium238 is not null and  CAST( tp.uranium238  AS DECIMAL(9,2)) >  ${uranium238} `;
            }
            
            
            if(thorium232>0){
                gty+=`and tp.thorium232 is not null and  CAST( tp.thorium232  AS DECIMAL(9,2)) >  ${thorium232} `;
            }
    
    
            if(radium226>0){
                gty+=` and tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${radium226} `;
            }
            
            if(totalThorium>0){
                gty+=` and tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${totalThorium} `;
            }
           
        }
        
        //水样
        let sy = '';
        if(totalUranium>0||waterTotalThorium>0||totalAlpha>0||totalBeta>0||waterRadium226>0)
        {
            sy+=` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid and tp.type = 3  `
            if(totalUranium>0){
                sy+=` and tp.totalUranium is not null and  CAST( tp.totalUranium  AS DECIMAL(9,2)) >  ${totalUranium} `;
            }
            
            if(waterTotalThorium>0){
                sy+=` and  tp.totalThorium is not null and CAST( tp.totalThorium  AS DECIMAL(9,2)) >  ${waterTotalThorium} `;
            }
    
            if(totalAlpha>0){
                sy+=` and tp.radium226 is not null and CAST( tp.totalAlpha  AS DECIMAL(9,2)) >  ${totalAlpha} `;
            }
            if(totalBeta>0){
                sy+=` and tp.totalBeta is not null and  CAST( tp.totalBeta  AS DECIMAL(9,2)) >  ${totalBeta} `;
            }
            //waterRadium226
            if(waterRadium226>0){
                sy+=` and  tp.radium226 is not null and CAST( tp.radium226  AS DECIMAL(9,2)) >  ${waterRadium226} `;
            }
           
            
        }
        

        //剂量率
        let jlv = '';
        if(result>0){
            if(controlType==0)
            {
                jlv+=` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid  AND 
                ((tp.type = 0 || tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
            }
            else
            {
                jlv+=` SELECT DISTINCT p.id  FROM ROMS202_PROJECT p,ROMS202_TASK t , ROMS202_TASKPOINT tp WHERE  t.projectid = p.id AND t.id = tp.taskid  AND 
                (( tp.type = 5) AND  tp.result IS NOT NULL AND CAST( tp.result  AS DECIMAL(9,2)) >  ${result}   ) `
            }
        }
         //剂量率 001
         if(gty.length==0 && sy.length== 0 && jlv.length>0)
         {
           
                s+=` and  project.id IN ( SELECT id FROM ( ${jlv} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
                 

         }
         
        //水样 010
        if(gty.length==0 && sy.length > 0 && jlv.length==0)
        {
            s+=` and  project.id IN ( SELECT id FROM ( ${sy} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
           
        }
        
          //  011
        if(gty.length==0 && sy.length >0 && jlv.length>0)
        {
              
            s+=` and  project.id IN ( SELECT id FROM ( ${jlv}  union all   ${sy}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
        }

        //固体样  100
        if(gty.length>0 && sy.length ==0 && jlv.length==0)
        {
            s+=` and  project.id IN ( SELECT id FROM ( ${gty} ) aaa  GROUP BY id HAVING COUNT(*) > 0) `;
        }

          //固体样+jlv  101
        if(gty.length>0 && sy.length ==0 && jlv.length>0)
        {
            s+=` and  project.id IN ( SELECT id FROM ( ${jlv}  union all   ${gty}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
        }

         //gty + 水样 110
         if(gty.length>0 && sy.length > 0 && jlv.length==0)
         {
            s+=` and  project.id IN ( SELECT id FROM ( ${sy}  union all   ${gty}  ) aaa  GROUP BY id HAVING COUNT(*) > 1) `;
         }

          //111
          if(gty.length>0 && sy.length> 0 && jlv.length>0)
          {
             s+=` and  project.id IN ( SELECT id FROM ( ${sy}  union all   ${gty}  union all   ${jlv}  ) aaa  GROUP BY id HAVING COUNT(*) > 2) `;
          }

	if(admin){
		let pro_sql=`SELECT DISTINCT company.moncompanyname, project.* FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
		ROMS202_DISTRICT district,
		ROMS202_CITY city
        WHERE
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
		company.districtid = district.id AND
		district.cityId = city.id AND
		city.provinceId = '${provinceId}'
        AND ${s}  
		ORDER BY project.createtime DESC`
		log.info(pro_sql)
		let __sql = `SELECT COUNT(distinct project.id) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
		ROMS202_DISTRICT district,
		ROMS202_CITY city
        WHERE 
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
          task.monstationid = station.id AND 
		  company.districtid = district.id AND
		  district.cityId = city.id AND
		  city.provinceId = '${provinceId}'
          AND ${s} `


          let tj_sql=`SELECT DISTINCT company.moncompanyname, project.* FROM  
          ROMS202_MONCOMPANY company , 
          ROMS202_PROJECT project ,
          ROMS202_TASK task,  
          ROMS202_TASKPOINT taskpoint ,
          ROMS202_MONSTATION station,
		  ROMS202_DISTRICT district,
		  ROMS202_CITY city
          WHERE
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
          task.monstationid = station.id AND 
		  company.districtid = district.id AND
		  district.cityId = city.id AND
		  city.provinceId = '${provinceId}' 
          AND ${s}  
          ORDER BY project.createtime DESC`
          
		let proInfo = await db.raw_select(pro_sql,[])
		let list = proInfo.result.map( async (i)=>{
			let companys= await  getCompanys(i.moncompanyId)
			let district = await getDistrict(i.moncompanyId)
			let monstationName = await getMonstation(i.monstationId)
			i.district=district.result[0].districtName
			i.monstationName=monstationName.result[0].monstationName
			i.name=companys.result[0].moncompanyName
			i.mineralSpecies=companys.result[0].mineralSpecies
			return i
		})
        
        let chucesql=`SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=0 `
        let xiangchasql=`SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=1 `

        let chucesql1=`SELECT COUNT(*) as count FROM (${tj_sql}) aaa where type=0 `
        let xiangchasql1=`SELECT COUNT(*) as count FROM (${tj_sql}) aaa  where type=1 `

        let chucesql2 = await db.raw_select(chucesql1,[])
        let xiangchasql2= await db.raw_select(xiangchasql1,[])
        let _count_obj = await db.raw_select(__sql,[])
        let _count_xiangcha= await db.raw_select(xiangchasql,[])
        let _count_chuce= await db.raw_select(chucesql,[])
        let showData=`初测企业共${_count_chuce.result[0].count}家，详查企业共${_count_xiangcha.result[0].count}家,其中符合搜索条件的初测企业有${chucesql2.result[0].count}家，详查企业有${xiangchasql2.result[0].count}家`
		Promise.all(list)
		.then(r=>{res.json({lists:r,count:_count_obj.result[0].count,showData});})
		.catch(e=>{res.json({lists:[],count:0})})

	}else if(monstationId){
		let pro_sql=`SELECT DISTINCT company.moncompanyname, project.* FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
		ROMS202_DISTRICT district,
		ROMS202_CITY city
        WHERE
        project.moncompanyid = company.id AND 
        task.projectid = project.id AND
        taskpoint.taskid = task.id AND 
        task.monstationid = station.id AND 
        company.districtid = district.id AND
		station.id='${monstationId}' AND
		district.cityId = city.id AND
		city.provinceId = '${provinceId}' 
        AND ${s}  
        ORDER BY project.createtime DESC`
		let __sql = `SELECT COUNT(distinct project.id) as count FROM  
        ROMS202_MONCOMPANY company , 
        ROMS202_PROJECT project ,
        ROMS202_TASK task,  
        ROMS202_TASKPOINT taskpoint ,
        ROMS202_MONSTATION station,
		ROMS202_DISTRICT district,
		ROMS202_CITY city
        WHERE 
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND 
          task.monstationid = station.id AND 
          company.districtid = district.id AND
		  project.monstationId='${monstationId}' AND
		  district.cityId = city.id AND
		  city.provinceId = '${provinceId}'
          AND ${s}  `


          let tj_sql=`SELECT DISTINCT company.moncompanyname, project.* FROM  
          ROMS202_MONCOMPANY company , 
          ROMS202_PROJECT project ,
          ROMS202_TASK task,  
          ROMS202_TASKPOINT taskpoint ,
          ROMS202_MONSTATION station,
		  ROMS202_DISTRICT district,
		  ROMS202_CITY city
          WHERE
          project.moncompanyid = company.id AND 
          task.projectid = project.id AND
          taskpoint.taskid = task.id AND
          project.monstationId='${monstationId}' AND 
          task.monstationid = station.id AND 
		  company.districtid = district.id AND
		  district.cityId = city.id AND
		  city.provinceId = '${provinceId}' 
          AND ${s} 
          ORDER BY project.createtime DESC`
          
		let proInfo = await db.raw_select(pro_sql,[])
		let list = proInfo.result.map( async (i)=>{
			let companys= await  getCompanys(i.moncompanyId)
			let district = await getDistrict(i.moncompanyId)
			let monstationName = await getMonstation(i.monstationId)
			i.district=district.result[0].districtName
			i.monstationName=monstationName.result[0].monstationName
			i.name=companys.result[0].moncompanyName
			i.mineralSpecies=companys.result[0].mineralSpecies
			return i
		})
        
        let chucesql=`SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=0 `
        let xiangchasql=`SELECT COUNT(*) as count FROM ROMS202_PROJECT  where type=1 `

        let chucesql1=`SELECT COUNT(*) as count FROM (${tj_sql}) aaa where type=0 `
        let xiangchasql1=`SELECT COUNT(*) as count FROM (${tj_sql}) aaa  where type=1 `

        let chucesql2 = await db.raw_select(chucesql1,[])
        let xiangchasql2= await db.raw_select(xiangchasql1,[])
        let _count_obj = await db.raw_select(__sql,[])
        let _count_xiangcha= await db.raw_select(xiangchasql,[])
        let _count_chuce= await db.raw_select(chucesql,[])
        let showData=`初测企业共${_count_chuce.result[0].count}家，详查企业共${_count_xiangcha.result[0].count}家,其中符合搜索条件的初测企业有${chucesql2.result[0].count}家，详查企业有${xiangchasql2.result[0].count}家`
		Promise.all(list)
		.then(r=>{res.json({lists:r,count:_count_obj.result[0].count,showData});})
		.catch(e=>{res.json({lists:[],count:0})})	
	}
	
}





//查询当前最后一个企业编号的数字 并加1返回
async function creat_new_num(){
	let _sql = `select moncompanyNum num from ROMS202_MONCOMPANY order by moncompanyNum desc limit 1`
	let back = await db.raw_select(_sql,[])
	if(back.success){
		let num = Number(back.result[0].num)
		let new_num = num+1
		switch(new_num){
			case new_num>=1&&new_num<=9 :
				new_num = '000'+new_num;
				break;
			case new_num>=10&&new_num<=99 :
				new_num = '00'+new_num;
				break;
			case new_num>=100&&new_num<=999 :
				new_num = '0'+new_num;
				break;
		}
		return new_num
	}else{
		return false
	}
}

//getMonstation
async function getMonstation(req,res){
	let keyWord = req.body.query
	let _sql = `select * from ROMS202_MONSTATION where monstationName like '%${keyWord}%'`
	let back = await db.raw_select(_sql,[])
	if(back.success){
		res.json({lists:back.result})
	}else{
		res.json({lists:[]})
	}
}

//getDistrict
async function getDistrict(req,res){
	let keyWord = req.body.query
	let _sql = `select * from ROMS202_DISTRICT where districtName like '%${keyWord}%'`
	let back = await db.raw_select(_sql,[])
	if(back.success){
		res.json({lists:back.result})
	}else{
		res.json({lists:[]})
	}
}

//获取所有企业信息
async function get_company(req,res){
	let pageIndex = req.body.pageIndex
	let pageSize = req.body.pageSize
	let pageStart 
	let keyword = req.body.keyword || ''
	let pageEnd
	if(pageSize<=0){
		pageStart = 0
		pageEnd = pageSize
	}else{
		pageStart = Number(pageIndex)*Number(pageSize)
		pageEnd = pageSize
	}

	let count
	let admin = req.session.admin
    let monuserPhone = req.session.monuserPhone
    let str=``
    let provinceId = req.session.provinceId 
    
    let monstationId = req.session.monstationId
    
    console.log('888',monuserPhone)
    if(monuserPhone==='admin'){
        
    }else if(monstationId){
        str+=`mon.monstationId='${monstationId}' AND `
    }
    else
    {
    	str+=`mon.provinceId='${provinceId}' AND `
    }
	if(true){
		let _sql = `SELECT mon.*,PIV.provinceName,CI.cityName,sta.monstationName 
		FROM ROMS202_MONCOMPANY mon JOIN ROMS202_MONSTATION sta ON mon.monstationId =
		 sta.id JOIN ROMS202_DISTRICT DIS ON DIS.id=mon.districtId
		JOIN ROMS202_CITY CI ON  mon.cityId= CI.id JOIN ROMS202_PROVINCE PIV ON 
        PIV.id =CI.provinceId where ${str} (mon.moncompanyName like '%${keyword}%' or mon.moncompanyNum like '%${keyword}%') ORDER BY moncompanyNum DESC limit ?,?`
		let _params = [pageStart,pageEnd]
		let back = await db.raw_select(_sql,_params)
		//此处添加企业识别码
		let backMap = back.result.map(item=>{
			item['code']='暂无'
			return item
		})
        let __sql=`select COUNT(*) as count from ROMS202_MONCOMPANY mon where ${str} (moncompanyName like '%${keyword}%' or moncompanyNum like '%${keyword}%')`
        console.log(__sql)
		let _count = await db.raw_select(__sql,[])
		//result[0].count
		if(_count.success){
			count=_count.result[0].count
		}else{
			count=0
		}
		res.json({companys:backMap,count:count})
	}
}
//get_company()

async function create_country_num(countryCode,cityId){
	let newNum
	//let str = countryCode+'%',cityId
	let str = countryCode+'%'
	
	let _sql = `select moncompanyNum from ROMS202_MONCOMPANY where moncompanyNum like ?  and cityId=? order by moncompanyNum desc limit 1`
	let back = await db.raw_select(_sql,[str,cityId])
	if(back.success){
		//如果有以该区域编号开头的编码
		let num = back.result[0].moncompanyNum
		newNum = Number(num)+1
		return newNum 
	}else{
		newNum = countryCode+'001'
		newNum = Number(newNum)
		return newNum
	}
}
async function add_company(req,res){
	let params = req.body 
	//判断企业是否重名
	let hasCompany = await has_this_company(params.moncompanyName)
	if(hasCompany){
		res.json({success:false,msg:'企业名称重复'})
		return;
	}


	/*新版创建编号逻辑*/

	let newNum = await create_country_num(req.body.code,params.districtId[1])
	let _sql = `insert into ?? (??) values (??) `
	let _key = [
		'id','provinceId','createtime','moncompanyName',
		'monstationId','mineralSpecies','displayUrl',
		'baseUrl','cityId','districtId','moncompanyNum','element','creditCode','organizationCode']
	let createtime = timing.now()
	let id = uuid()
	let _val = [
		id,params.districtId[0],createtime,params.moncompanyName,
		params.monstation,params.mineralSpecies,
		params.displayUrl,params.baseUrl,params.districtId[1],
		params.districtId[2],newNum,params.element,params.creditCode,params.organizationCode
	]
	let _params = ['ROMS202_MONCOMPANY',_key,_val]
	let back = await db.raw_insert(_params)
	back.affected?res.json({id:id,success:true,msg:'添加成功',moncompanyNum:newNum}):res.json({success:false,msg:'添加失败'})
}
//add_company_info()

async function has_this_company(name){
	let _sql = 'select * from ROMS202_MONCOMPANY where moncompanyName = ? '
	let back = await db.raw_select(_sql,[name])
	return back.success
}

async function delete_company(req,res){
	let params = req.body
	let companyId = params.delete_id
	let num = Number(params.delete_num)
	let _params = ['ROMS202_MONCOMPANY',{id:params.delete_id}]
	let back = await db.delete(_params)
	/*---------------------删除企业后将该编号插入DEL表用于下次使用--------------------------*/

		
		//删除成功
		if(back.affected){
			let id = uuid()
			let time = timing.format(Date.now())
			//let _sql = `insert into ?? (??) values (??) ` //`insert into ?? (??) values (??)`
			let _keys =['id','time','num','companyId']
			let _vals =[id,time,num,companyId]
			let _paramsx = ['ROMS202_DEL',_keys,_vals]		
			let backx = await db.raw_insert(_paramsx)


			if(backx.affected){
				//插入DEL表成功
				res.json({success:true,msg:'删除成功',note:'删除编号保存成功'})
				return
			}else{
				res.json({success:true,msg:'删除成功',note:'删除编号保存失败'})
				//
			}
		}else{
			//删除失败
			res.json({success:false,msg:'删除失败'})
		}
}

async function update_company(req,res){
	let params = req.body
	let _change = {
		moncompanyName:params.moncompanyName,
		mineralSpecies:params.mineralSpecies,
		displayUrl:params.displayUrl,
		moncompanyNum:params.moncompanyNum,
		element:params.element,
		baseUrl:params.baseUrl
	}
	let _params = ['ROMS202_MONCOMPANY',_change,{id:params.update_id}]
	let back = await db.update(_params)
	back.affected?res.json({success:true,msg:'更新成功'}):res.json({success:false,msg:'更新失败'})
}

async function get_company_name_type(companyId){
	let _sql = 'select ?? as name ,?? as type , ?? as id from ?? where id = ? '
	let _val = ['moncompanyName','mineralSpecies','districtId','ROMS202_MONCOMPANY',companyId]
	let back = await db.raw_select(_sql,_val)
	if(back.success){
		return back.result[0]
	}else{
		return {name:'',type:''}
	}
}

async function get_all_gps_project2(req,res){
	req.session.admin=true
	let provinceId = req.body.params.provinceId
	let speciesType = req.body.params.speciesType || ''
	let companyType = req.body.params.comtype || ''
	let monstationName = req.body.params.name
	let districtName=req.body.params.district || ''
	let companyCode = req.body.params.code || ''
	let stationname = req.body.params.monstation || ''
	let species = req.body.params.species || ''
	let result = req.body.params.result || 0
	let comname =req.body.params.comname || ''


	let radium226 = req.body.params.radium226 || 0
	let thorium232 = req.body.params.thorium232 || 0
	let totalAlpha = req.body.params.totalAlpha || 0
	let totalBeta = req.body.params.totalBeta || 0
	let totalThorium = req.body.params.totalThorium || 0
	let totalUranium = req.body.params.totalUranium || 0
	let uranium228 = req.body.params.uranium228 || 0

	let admin = req.session.admin
	let monstationId = req.session.stationId 
	let s = "1=1 ";
		if(radium226>0){
			s+=`and (PO.radium226 is not null and CAST( PO.radium226  AS DECIMAL(9,2)) >  ${radium226} )`;
		}

		if(result>0){
			s+=`and (PO.result is not null and CAST( PO.result  AS DECIMAL(9,2)) >  ${result} )`;
		}

		if(thorium232>0){
			s+=`and (PO.thorium232 is not null and  CAST( PO.thorium232  AS DECIMAL(9,2)) >  ${thorium232} )`;
		}
		if(totalAlpha>0){
			s+=`and (PO.radium226 is not null and CAST( PO.totalAlpha  AS DECIMAL(9,2)) >  ${totalAlpha} )`;
		}
		if(totalBeta>0){
			s+=`and (PO.totalBeta is not null and  CAST( PO.totalBeta  AS DECIMAL(9,2)) >  ${totalBeta} )`;
		}
		if(totalThorium>0){
			s+=`and (PO.totalThorium is not null and CAST( PO.totalThorium  AS DECIMAL(9,2)) >  ${totalThorium} )`;
		}
		if(totalUranium>0){
			s+=`and (PO.totalUranium is not null and  CAST( PO.totalUranium  AS DECIMAL(9,2)) >  ${totalUranium} )`;
		}
		if(uranium228>0){
			s+=`and (PO.uranium228 is not null and  CAST( PO.uranium228  AS DECIMAL(9,2)) >  ${uranium228} )`;
		}


	if(req.session.admin){

		let pro_sql=`SELECT phone , moncompanyId,lng,lat,type,contact,id,companyCode FROM 
		ROMS202_PROJECT WHERE id IN (SELECT TA.projectId FROM ROMS202_TASK TA JOIN ROMS202_TASKPOINT PO
		ON TA.id=PO.taskId join ROMS202_MONCOMPANY MON on MON.id=PO.moncompanyId join
		ROMS202_MONSTATION STA on TA.monstationId=STA.id join ROMS202_DISTRICT DIS
		on MON.districtId = DIS.id join ROMS202_CITY CI on CI.id=DIS.cityId  WHERE CI.provinceId='${provinceId}' AND  DIS.districtName like '%${districtName}%' AND STA.monstationName 
		LIKE '%${stationname}%' AND MON.mineralSpecies LIKE '%${speciesType}%' AND TA.pass <>2  AND 
		MON.moncompanyName LIKE '%${comname}%' AND ${s}) AND companyType LIKE '%${companyType}%' AND companyCode 
		LIKE '%${companyCode}%'`
		
		// let __sql = `SELECT COUNT(*) as count FROM ROMS202_PROJECT  WHERE id IN (SELECT TA.projectId FROM ROMS202_TASK TA JOIN ROMS202_TASKPOINT PO
		// 	ON TA.id=PO.taskId join ROMS202_MONCOMPANY MON on MON.id=PO.moncompanyId join 
		// 	ROMS202_MONSTATION STA on TA.monstationId=STA.id join ROMS202_DISTRICT DIS on MON.districtId = DIS.id 
		// 	WHERE DIS.districtName like '%${districtName}%' AND STA.monstationName LIKE '%${stationname}%' AND MON.mineralSpecies 
		// 	LIKE '%${speciesType}%' AND TA.pass <>2  AND MON.moncompanyName LIKE '%${comname}%' AND ${s})  AND companyType LIKE '%${companyType}%' 
		// 	AND companyCode LIKE '%${companyCode}%'`
		
		let proInfo = await db.raw_select(pro_sql,[])
		let list = proInfo.result.map( async (i)=>{
			let companys= await  getCompanys(i.moncompanyId)
			//let monstationName = await getMonstation(i.monstationId)
			i.moncompanyName=companys.result[0].moncompanyName
			i.mineralSpecies=companys.result[0].mineralSpecies
			return i
		})
		//let _count_obj = await db.raw_select(__sql,[])
		Promise.all(list)
		.then(r=>{res.json({lists:r});})
		.catch(e=>{res.json({lists:[],count:0})})

		
	}else if(req.session.stationId){
		//地方站点用户
		//先获取所有检测人员  然后遍历检测人员任务数据
		let pro_sql=`SELECT type,contact,monstationId, id,companyCode,moncompanyId, companyUrl FROM 
		ROMS202_PROJECT WHERE id IN (SELECT TA.projectId FROM ROMS202_TASK TA JOIN ROMS202_TASKPOINT PO
		ON TA.id=PO.taskId join ROMS202_MONCOMPANY MON on MON.id=PO.moncompanyId join
		ROMS202_MONSTATION STA on TA.monstationId=STA.id join ROMS202_DISTRICT DIS
		on MON.districtId = DIS.id  WHERE  DIS.districtName like '%${districtName}%' AND STA.monstationName 
		LIKE '%${stationname}%' AND MON.mineralSpecies LIKE '%${speciesType}%' AND TA.pass <>2  AND 
		MON.moncompanyName LIKE '%${comname}%') AND ${s}  AND companyType LIKE '%${companyType}%' AND companyCode 
		LIKE '%${companyCode}%' AND monstationId='${monstationId}' order by createtime desc limit ${pageStart},${pageEnd}`
		let __sql = `SELECT COUNT(*) as count FROM ROMS202_PROJECT  WHERE id IN (SELECT TA.projectId FROM ROMS202_TASK TA JOIN ROMS202_TASKPOINT PO
			ON TA.id=PO.taskId join ROMS202_MONCOMPANY MON on MON.id=PO.moncompanyId join ROMS202_MONSTATION STA on TA.monstationId=STA.id join ROMS202_DISTRICT DIS on MON.districtId = DIS.id WHERE DIS.districtName like '%${districtName}%' AND STA.monstationName LIKE '%${stationname}%' AND MON.mineralSpecies LIKE '%${speciesType}%' AND TA.pass <>2  AND MON.moncompanyName LIKE '%${comname}%' AND ${s}) AND companyType LIKE '%${companyType}%' AND companyCode LIKE '%${companyCode}%' AND  monstationId='${monstationId}'`
		let proInfo = await db.raw_select(pro_sql,[])
		let list = proInfo.result.map( async (i)=>{
			let tasks= await  getTasks(i.id)
			let companys= await  getCompanys(i.moncompanyId)
			let district = await getDistrict(i.moncompanyId)
			let monstationName = await getMonstation(i.monstationId)
			i.tasks=tasks.result;
			i.district=district.result[0].districtName
			i.monstationName=monstationName.result[0].monstationName
			i.name=companys.result[0].moncompanyName
			i.companyType=companys.result[0].mineralSpecies
			return i
		})
		let _count_obj = await db.raw_select(__sql,[])
		Promise.all(list)
		.then(r=>{res.json({lists:r,count:_count_obj.result[0].count});})
		.catch(e=>{res.json({lists:[],count:0})})
	}else{
		res.json({lists:[],msg:'权限过期,请重新登录',note:'Access Denied'})
	}
}

async function get_source_by_companyId(id){
	let _sql = `select MON.moncompanyName, PO.* from ROMS202_TASKPOINT PO join ROMS202_MONCOMPANY MON on MON.id=PO.moncompanyId where PO.moncompanyId = ? order by sampleType desc`
	let _params = [id]
	let back = await db.raw_select(_sql,_params)
	if(back.success){
		return back.result
	}else{
		return [];
	}
}
async function get_single_project(req,res){
	res.json({lists:[{lat:'28.080741',lng:'107.018342',companyId:'b5658855-729d-11e7-af8e-14187743d00e',name:'模拟'}]})
}
async function get_round_line(req,res){
	let id = req.body.id
	let _sql_a = `select lat,lng from ROMS202_COMPANYGPS `
	let back_a = await db.raw_select(_sql_a,[])
	let _sql_b = `select ?? from ROMS202_TASKPOINT where moncompanyId = ? order by sampleType desc`
	let _keys = ['analyzeProject','avg','createtime','depict','lat','lng','result','sampleArea','sampleType','sampleName']
	let _params = [_keys,id]
	let back = await db.raw_select(_sql_b,_params)
	res.json({lists:back.result,round:back_a.result,msg:'模拟成功'})
}



async function getCompanys(id){
	let _sql = `SELECT * from ROMS202_MONCOMPANY  where id='${id}'`
	let back = await db.raw_select(_sql,[])
	return back
}

async function monstationName(id){
	let _sql = `SELECT * from ROMS202_MONCOMPANY  where id='${id}'`
	let back = await db.raw_select(_sql,[])
	return back
}

async function getDistrict(id){
	let _sql = `SELECT DIS.* from ROMS202_MONCOMPANY MON join ROMS202_DISTRICT DIS on MON.districtId=DIS.id where MON.id='${id}'`
	let back = await db.raw_select(_sql,[])
	return back
}

async function getMonstation(id){
	let _sql = `SELECT * from ROMS202_MONSTATION where id='${id}'`
	let back = await db.raw_select(_sql,[])
	return back
}



/*-----------------------------------------------------------------------------------------*/
const company = {
	get_company:get_company,
	add_company:add_company,
	update_company:update_company,
	delete_company:delete_company,
	get_company_name_type:get_company_name_type,
	get_all_gps_project:get_all_gps_project,
	get_source_by_companyId:get_source_by_companyId,
	get_single_project:get_single_project,
	get_round_line:get_round_line,
	getMonstation:getMonstation,
	getDistrict:getDistrict,
}
module.exports = company




