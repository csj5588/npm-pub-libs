/**
 * Created by cuishijie.
 */

const co = require('co');
const xtpl = require('xtpl');
const fs = require('fs');
const thunkify = require('thunkify');
const path = require('path');
const prettier = require('prettier');
const request = require('request');
const { NodeVM } = require('vm2');
const { mkdirPath } = require('./tools');
const { cs } = require('./tools/console');

exports.run = function(schema, file) {
	const _file = file || 'code';
	cs('schema compilation start')
	return new Promise(function(resolve, reject) {
		const vm = new NodeVM({
			console: 'inherit',
			sandbox: {}
		});
		co(function*() {
			const xtplRender = thunkify(xtpl.render);
			const code = fs.readFileSync(
				path.resolve(__dirname, `./compile/index.js`),
				'utf8'
			);
			const dataJSON = fs.readFileSync(
				path.resolve('', `./${schema}`),
				'utf8'
			);

			const moduleDataJson = dataJSON.replace('export default', 'module.exports =')

			const data = vm.run(moduleDataJson);
			
			const renderInfo = vm.run(code)(data, {
				prettier: prettier,
				request: request,
				responsive: {
					width: 750,
					viewportWidth: 375
				},
				utils: {
				}
			});
		
			if (renderInfo.noTemplate) {
				renderInfo.panelDisplay.forEach((file) => {
					mkdirPath(`./${_file}`);
					fs.writeFileSync(path.join('', `./${_file}/${file.panelName}`), file.panelValue);
				});
			} else {
				const renderData = renderInfo.renderData;
				const ret = yield xtplRender(
					path.resolve(__dirname, './compile/template.xtpl'),
					renderData,
					{}
				);
		
				const prettierOpt = renderInfo.prettierOpt || {
					printWidth: 120
				};
		
				const prettierRes = prettier.format(ret, prettierOpt);
		
				fs.writeFileSync(path.join(__dirname, `./${_file}/result.js`), prettierRes);
			}
			resolve(cs('schema compilation completed'))
		});
	})
};
