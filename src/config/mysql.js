
let env = process.env.NODE_ENV
let obj


if(env=='production'){
	obj = {
		host:'118.178.18.106',
		user:'roms',
		password:'roms!118',
		database:'roms'
	}
}else if(env=='198'){
	obj = {
		host:'192.168.1.198',
		user:'root',
		password:'linkivr2016!roms',
		database:'roms'
	}
}else{
	obj = {
		host:'xtroms.com',
		user:'root',
		password:'linkivr2016!roms',
		database:'roms'
	}
}



module.exports = obj