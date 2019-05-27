const compressing = require('compressing');
const path = require('path');
const fs = require('fs');
const md5 = require("md5");
const fread = require("fs-readdir-recursive");
const crypto = require('crypto');
function hashFile(filename) {
    return new Promise(function (s) {
        var hash = crypto.createHash('md5'),
            stream = fs.createReadStream(filename);
        //stream.pipe(writeStream);
        //console.log('Hashing: ', filename);
        stream.on('data', function (data) {
            hash.update(data, 'utf8');
        });
        stream.on('end', function () {
            s(hash.digest('hex'));
        });
    });
}
module.exports = async function (ctx) {
    var wwwPath = path.join(ctx.opts.projectRoot, 'www');
    if (!fs.existsSync(wwwPath)) {
        console.log("www目录不存在");
        return;
    }
    var files = fread(wwwPath, p => !p.includes("DongmeiIonic.zip")||!p.includes("filesHash.json"));
    var md5JsonFiles = [];
    for (let i = 0; i < files.length; i++) {
        console.log(`处理 ${Math.floor((i + 1) / files.length * 100).toFixed(1)}%`);
        const file = files[i];
        const hashStart = Date.now();
        const hash = await hashFile(path.join(wwwPath, file));
        const hashEnd = Date.now();
        md5JsonFiles.push({
            file: file,
            // size: bs.length,
            hash: hash,
            // hashTime: hashEnd - hashStart
        });
    }
    fs.writeFileSync(path.join(wwwPath, 'filesHash.json'), JSON.stringify(md5JsonFiles, null, 2), { encoding: "utf8" });
    var compressingComplete = false;
    await compressing.zip.compressDir(wwwPath, 'DongmeiIonic.zip')
        .then(() => {
            console.log('压缩文件 success');
            const destZipFilePath = path.join(wwwPath, 'assets', 'DongmeiIonic.zip');
            if (fs.existsSync(destZipFilePath)) {
                fs.unlinkSync(destZipFilePath);
                console.log(`成功删除文件${destZipFilePath}`);
            }
            const s = Date.now();
            fs.copyFileSync(path.join(ctx.opts.projectRoot, 'DongmeiIonic.zip'), destZipFilePath);
            console.log(`拷贝zip文件完成，耗时：【${Date.now() - s}】ms`);
            compressingComplete = true;
        })
        .catch(err => {
            console.error("压缩处理异常", err);
            compressingComplete = true;
        });
    var st = Date.now();
    // await new Promise(s => {
    //     setTimeout(() => {
    //         s(true);
    //     }, 5000);
    // });
    console.log(`压缩文件处理完成 compressingComplete=${compressingComplete},耗时${Date.now() - st}ms`);
    // // 解压缩
    // compressing.zip.uncompress('nodejs-compressing-demo.zip', 'nodejs-compressing-demo3')
    //     .then(() => {
    //         console.log('success');
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     });

}
