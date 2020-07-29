function cut() {
	console.log('------------------------------------------------------------', '\n');
}

function cs(info) {
	cut();
	console.log('\x1B[32m%s\x1B[39m', `*****************${info}***************`, '\n');
	cut();
}

module.exports = {
	cs,
	cut,
}