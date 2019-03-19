function getAllTime(time){
    let now = new Date(time)
    let year = now.getFullYear();
    let month = now.getMonth()+1;
    let day = now.getDate();

    month = month>9?month:'0'+month

    day = day>9?day:'0'+day

//  return year+'-'+month+'-'+day+' 00:00:00'
     return year+'-'+month+'-'+day
}

module.exports={
    getAllTime
}