const path = require('path');
const fs = require('fs');

function mkdirPath(pathStr) {
	var projectPath = path.join(process.cwd());
	var tempDirArray = pathStr.split('\\');
	for (var i = 0; i < tempDirArray.length; i++) {
		projectPath = projectPath+'/'+tempDirArray[i];
		if (fs.existsSync(projectPath)) {
			var tempstats = fs.statSync(projectPath);
			if (!(tempstats.isDirectory())) {
				fs.unlinkSync(projectPath);
				fs.mkdirSync(projectPath);
			}
		}
		else{
			fs.mkdirSync(projectPath);
		}
	}
	return projectPath;
}

function stringFirstToUpperCase(str) {
	return str.split('').map((x, i) => !i ? x.toUpperCase() : x).join('');
}

module.exports = {
	mkdirPath,
	stringFirstToUpperCase,
}