const db = require('./connect.js')
const uuid = require('uuid/v4')
const Time = require('easy-time-parser')
const timing = new Time()
const company = require('./company.js')
const area = require('./area.js')
async function get_company_by_project(projectid){
	let _sql = `select moncompanyId as id from ROMS202_PROJECT where id = ?`
	let back = await db.raw_select(_sql,[projectid])
	return {id:back.result[0].id}
}
async function get_company_and_district(companyid){
 	let _company_sql = `select moncompanyName as name ,districtId as id,mineralSpecies  from ROMS202_MONCOMPANY where id = ? `
	let back = await db.raw_select(_company_sql,[companyid])
	let districtId = back.result[0].id
	let district = await area.getDistrictName(districtId)
	 
 	return {district:district,name:back.result[0].name}
}

const project = {
	getCompany:get_company_by_project,
	getDistict:get_company_and_district
}
module.exports = project