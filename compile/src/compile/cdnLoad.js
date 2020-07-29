let fs = require('fs'); // 引入文件读取模块
let request = require('request');
const { mkdirPath } = require('../tools');
const { cs } = require('../tools/console');

exports.run = function(file) {
  const _file = file || 'code';
  return new Promise(function(resolve, reject) {
    let list = fs.readdirSync(`./${_file}`)

    cs('Start downloading CDN pictures');

    list.forEach(file => {
      const isFile = /\.(js|jsx|less)$/.test(file);
      if (!isFile) return;
      let contentText = fs.readFileSync(`./${_file}/${file}`, 'utf-8');

      let arr = [];
      contentText = contentText.replace(/http[s]?:\/\/.+\.(jpg|gif|png)/g, res => {
        let filename =  res.split('/').pop();
        arr.push(res);
        return `/images/${filename}`;
      })
      arr.forEach((url, idx)=>{
        let filename =  url.split('/').pop()
        mkdirPath('./images');
        request({url}).pipe(
          fs.createWriteStream(`./images/${filename}`).on('close', err => {})
        )     
      })

      fs.writeFile(`./${_file}/${file}`, contentText, res => {
        cs('CDN image download completed');
        resolve();
      });
    })
  })
}
  