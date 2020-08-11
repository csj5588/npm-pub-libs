const path = require('path');
const inquirer = require('inquirer')
const child_process = require('child_process');
const request = require('request');
const ora = require('ora');

const materialsJsonUrl = 'http://testact.inke.cn/ikice-materials/react-materials.json';

exports.run = function(schema) {
  const _fileName = schema || 'materials';

  async function getMaterialsJson() {
    return await new Promise((resolve, reject) => {
      request.get(materialsJsonUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log('reponse success')
          resolve(JSON.parse(body).blocks);
        } else {
          // console.log('reponse error')
          reject('error');
        }
      }); 
    });
  }
  getMaterialsJson().then(blocks => {
    const choice = blocks.map(materialInfo => {
      const { source } = materialInfo;
      return {
        name: materialInfo.description,
        value: source,
      }
    });

    // console.log('choice list success');

    // choices step
    const prompsStep = {
      type: 'list',
      name: 'materials',
      message: '请选择要安装的物料',
    }
    prompsStep.choices = choice;

    // choices
    const promps = [];
    promps.push(prompsStep);

    inquirer.prompt(promps).then(function (answers) {
      const { materials } = answers;
      // console.log('choice answers success', answers);
      // loading
      const spinner = ora('Installing, please wait').start();
      spinner.color = 'yellow';

      // console.log('path', `npm install ${materials.npm}@${materials.version} --no--save`);

      child_process.exec(`cd ${path.resolve(__dirname, "./../../")} && npm install ${materials.npm}@${materials.version} --no--save`, function(err, stdout) {
        if (!err) {
          const localPath = `./../../node_modules/${materials.npm}/src`
          copyMaterials(localPath)
          spinner.succeed('installation is complete, enjoy!')
        }
      })
    })
  });

  function copyMaterials(materialsPath) {
  
    // liunx
    function copyIt(from, to) {
      child_process.spawn('cp', ['-r', from, to]);	
    }

    copyIt(path.resolve(__dirname, materialsPath), _fileName);
  }
}
