let env = 'production'
const obj = {}
obj.val=env
if(env=='production'){

	console.log('------------静态文件上传阿里云-------------')
	obj.baseUrl = '/roms/web/roms/monuserImg/'
	obj.companyImgUrl = '/roms/web/roms/companyImg/'
	obj.pdfUrl = '/roms/web/roms/roms202/'
}else if(env=='198'){
	console.log('------------静态文件上传阿里云-------------')
	obj.baseUrl = '/roms/web/roms/monuserImg/'
	obj.companyImgUrl = '/roms/web/roms/companyImg/'
	obj.pdfUrl = '/roms/web/roms/roms202/'
}else{
	console.log('------------静态文件上传阿里云-------------')
	obj.baseUrl = '/roms/web/roms/monuserImg/'
	obj.companyImgUrl = '/roms/web/roms/companyImg/'
	obj.pdfUrl = '/roms/web/roms/roms202/'
}

module.exports = obj
