// const gulp = require('gulp');
const { src, dest, series } = require('gulp');
const through2 = require('through2');
const needle = require('needle');
const fs = require('fs');
const os = require('os');
const { cs } = require('./tools/console');

const srcDir = './images';
let codeDir = 'code';
const uploadUrl = 'https://betaboc.inke.cn:9000/upload'
// const appJson = require('./miniprogram/app.json');
let originMapObj = {}
if (fs.existsSync('./img-map.json')) {
  const originMap = fs.readFileSync('./img-map.json')
  try {
    originMapObj = JSON.parse(originMap.toString())
  } catch (error) {
    originMapObj = {}
  }
}

function saveImgMap(cb) {
  fs.writeFile('./img-map.json', JSON.stringify(originMapObj, null, 2), function() {
    cb()
  })
}

function uploadImg() {
  cs('Image Uploading inke CDN')
  return through2.obj(function (chunk, enc, cb) {
    // console.log('thr2 in gulp', chunk.path.replace(chunk._cwd, ''))
    // const data = { [chunk.path.replace(chunk._cwd, '')]: '' }
    // if (!originMapObj[chunk.path.replace(chunk._cwd, '')]) {
    //   originMapObj[chunk.path.replace(chunk._cwd, '')] = ''
    // }
    if (originMapObj[chunk.path.replace(chunk._cwd, '')]) {
      cb(null, chunk)
      return
    }
    const data = { file_0: chunk }
    needle
      .post(uploadUrl, data, { multipart: true }, function (err, res, body) {
        console.log(body.data[0].url, '\x1B[32m', '\x1B[39m', '成功√')
        // if (!originMapObj[chunk.path.replace(chunk._cwd, '')]) {
        originMapObj[chunk.path.replace(chunk._cwd, '')] = body.data[0].url
        // }
        cb(null, chunk)
      })
    // cb(null, chunk)
  })
}

function replaceUrl() {
  cs('Picture key replacing')
  const _file = codeDir || 'code';
  const isWindows = os.platform().includes('win');
  return src(`./${_file}/**/*`)
    .pipe(
      through2.obj(function (chunk, _, cb) {
        if (chunk.isBuffer()) {
          let contents = chunk.contents.toString();
          for (let key in originMapObj) {
            const _key = isWindows ? key.replace(/\\/g, "/") : key;

            console.log('originMapObj', _key, originMapObj[key], new RegExp(_key, 'gim'), contents.includes(_key));

            const reOriginMapObj = originMapObj[key].replace(/\\/g, "/");
            
            if (contents.includes(_key)) {
              contents = contents.replace(new RegExp(_key, 'gim'), reOriginMapObj)
            }
          }
          chunk.contents = Buffer.from(contents);
        }
        cb(null, chunk);
      })
    ).pipe(
      dest(file => {
        return file.base; // 压缩到原目录
      })
    );
}

function cleanImages() {

  _clean = () => {
    fs.exists(srcDir, function(exists) {
      exists && fs.readdirSync(srcDir).map((file) => {
        fs.unlink(`${srcDir}/${file}`,(err) => {
          if (err) {
            console.log(err);
          }
        });
      });
      cs('Cache clear completed')
      console.log('\x1B[36m%s\x1B[39m', '*********编译后的代码在code文件夹下，可以导出使用***********', '\n');
      // 删除文件夹及文件
      deleteFolder('./images');
      fs.unlink('./img-map.json',(err) => {
        if (err) {
          console.log(err);
        }
      });
    })
  }

  return new Promise((resolve, reject) => {
    resolve(_clean());
  });
}

function img() {
  cs('Picture reading')
  return src(`${srcDir}/**/*.{png,jpe?g,gif}`)
    .pipe(
      uploadImg()
    )
}

function deleteFolder(path) {
  let files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      let curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

exports.run = function(file) {
  codeDir = file || 'code';
  series(img, saveImgMap, replaceUrl, cleanImages)()
};