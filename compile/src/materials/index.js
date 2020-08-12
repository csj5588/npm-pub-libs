const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer')
const child_process = require('child_process');
const request = require('request');
const ora = require('ora');
const utils = require('./../tools')

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
      // loading
      const spinner = ora('Installing, please wait').start();
      spinner.color = 'blue';

      child_process.exec(`cd ${path.resolve(__dirname, "./../../")} && npm install ${materials.npm}@${materials.version} --no--save`, function(err, stdout) {
        if (!err) {
          const localPath = `./../../node_modules/${materials.npm}/src`
          copyMaterials(localPath)
          spinner.succeed('installation is complete, Keyword has been replaced, enjoy it!')
        }
      })
    })
  });

  function copyMaterials(materialsPath) {
    // liunx
    function copyIt(from, to) {
      child_process.spawn('cp', ['-r', from, to]);
      // timeout replace keyword to busi
      setTimeout(() => {
        const filePath = path.resolve(_fileName);
        fileLoop(filePath)
      }, 1000)
    }

    copyIt(path.resolve(__dirname, materialsPath), _fileName);
  }
  // loop
  function fileLoop(filePath) {
    fs.readdir(filePath, function(err, files) {
      if (err) {
        console.warn(err)
      } else {
        files.forEach(function(filename) {
          var filedir = path.join(filePath, filename);
          fs.stat(filedir, function(eror, stats) {
            if (eror) {
              console.warn('获取文件stats失败');
            } else {
              var isFile = stats.isFile();
              var isDir = stats.isDirectory();
              if (isFile) {
                // read
                var content = fs.readFileSync(filedir, 'utf-8');
                // rewrite
                const reComponentNameContent = content.replace(/\Materials/g, utils.stringFirstToUpperCase(_fileName));
                const _content = reComponentNameContent.replace(/\materials/g, _fileName)
                rewrite(filedir, _content)
              }
              if (isDir) {
                fileLoop(filedir);
              }
            }
          })
        });
      }
    });
  }

  function rewrite(childPath, content) {
    fs.writeFile(childPath, content, function() {
      // over
    })
  }
}

// 监测是否有重复文件夹
// 批量替换关键字
