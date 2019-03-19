function parseTime(time){
	let _rawtime = Date.parse(time)
	let datetime=new Date(time)
	let obj={
		Y:datetime.getFullYear()+'',
		M:datetime.getMonth()+1>=10?(datetime.getMonth()+1)+'':'0'+(datetime.getMonth()+1),
		D:datetime.getDate()>=10?datetime.getDate()+'':'0'+datetime.getDate(),
		h:datetime.getHours()>=10?datetime.getHours()+'':'0'+datetime.getHours(),
		m:datetime.getMinutes()>=10?datetime.getMinutes()+'':'0'+datetime.getMinutes(),
		s:datetime.getSeconds()>=10?datetime.getSeconds()+'':'0'+datetime.getSeconds()
	}
	
		let realtime=obj.Y+'-'+obj.M+'-'+obj.D+' '+obj.h+':'+obj.m+':'+obj.s
		return realtime

}

function parseMoreTime(time){
    let times = new Date(time);
    let year = times.getFullYear();
    let month = times.getMonth()+1
    let date = times.getDate()
    let hours = times.getHours()
    let minutes = times.getMinutes()
    let seconds = times.getSeconds()
    month=month>9?month:'0'+month
    date=date>9?date:'0'+date
    return year+'-'+month+'-'+date+' '+'23:59:59'
}
function parseLittleTime(time){
    let times = new Date(time);
    let year = times.getFullYear();
    let month = times.getMonth()+1
    let date = times.getDate()
    let hours = times.getHours()
    let minutes = times.getMinutes()
    let seconds = times.getSeconds()
    month=month>9?month:'0'+month
    date=date>9?date:'0'+date
    return year+'-'+month+'-'+date+' '+'00:00:00'
}
function getbeforetime(time){
    let times = new Date(time);
    let year = times.getFullYear();
    let month = times.getMonth()+1
    let date = times.getDate()
    let hours = times.getHours()
    let minutes = times.getMinutes()
    let seconds = times.getSeconds()
    month=month>9?month:'0'+month
    date=date>9?date:'0'+date
    return year+'-'+month+'-'+date
}
function parseTime2(time){
	let _rawtime = Date.parse(time)
	let datetime=new Date(time)
	let obj={
		Y:datetime.getFullYear()+'',
		M:datetime.getMonth()+1>=10?(datetime.getMonth()+1)+'':'0'+(datetime.getMonth()+1),
		D:datetime.getDate()>=10?datetime.getDate()+'':'0'+datetime.getDate(),
		h:datetime.getHours()>=10?datetime.getHours()+'':'0'+datetime.getHours(),
		m:datetime.getMinutes()>=10?datetime.getMinutes()+'':'0'+datetime.getMinutes(),
		s:datetime.getSeconds()>=10?datetime.getSeconds()+'':'0'+datetime.getSeconds()
	}
	
		let realtime=obj.Y+'-'+obj.M+'-'+obj.D
		return realtime

}
function makeDateTime(){
	let datetime=new Date()
	let obj={
		Y:datetime.getFullYear()+'',
		M:datetime.getMonth()+1>=10?(datetime.getMonth()+1)+'':'0'+(datetime.getMonth()+1),
		D:datetime.getDate()>=10?datetime.getDate()+'':'0'+datetime.getDate(),
		h:datetime.getHours()>=10?datetime.getHours()+'':'0'+datetime.getHours(),
		m:datetime.getMinutes()>=10?datetime.getMinutes()+'':'0'+datetime.getMinutes(),
		s:datetime.getSeconds()>=10?datetime.getSeconds()+'':'0'+datetime.getSeconds()
	}
	return {
		time:obj.Y+'-'+obj.M+'-'+obj.D+' '+obj.h+':'+obj.m+':'+obj.s
	} 
}

exports.parseTime = parseTime
exports.parseLittleTime = parseLittleTime
exports.parseMoreTime = parseMoreTime
exports.parseTime2 = parseTime2
exports.makeDateTime = makeDateTime
exports.getbeforetime = getbeforetime

