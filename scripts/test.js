const compressing = require("compressing");
const path = require("path");
const fs = require("fs");
// const md5 = require("md5");
const fread = require("fs-readdir-recursive");
const crypto = require("crypto");
// const { spawn } = require("child_process");
function hashFile(filename) {
    return new Promise(function (s) {
        var hash = crypto.createHash("md5"),
            stream = fs.createReadStream(filename);
        //stream.pipe(writeStream);
        //console.log('Hashing: ', filename);
        stream.on("data", function (data) {
            hash.update(data, "utf8");
        });
        stream.on("end", function () {
            s(hash.digest("hex"));
        });
    });
}
var wwwPath = path.join(`C:`, `Users`, `manbiao`, `Desktop`, `com.skytrip.dmonline.android`, "www");
console.log(wwwPath)
if (!fs.existsSync(wwwPath)) {
    console.log("www目录不存在");
    return;
}

var files = fread(
    wwwPath,
    p => !p.includes(".zip") || !p.includes("filesHash.json")
);
var md5JsonFiles = [];
const old = JSON.parse(fs.readFileSync(path.join(wwwPath, "filesHash.json"), { encoding: "utf-8" }));
console.log(`文件总数${old.length}个`, `实际文件个数${files.length}`)
const miss = [];
const unmatch = [];
const match = [];
const ps = [];
for (let i = 0; i < files.length; i++) {
    const file = files[i];
    ps.push(hashFile(path.join(wwwPath, file)));
}
Promise.all(ps).then(res => {
    // console.log(res)
    for (let i = 0; i < files.length; i++) {
        const file=files[i];
        const hash = res[i];
        const o = old.find(it => it.file == file);
        if (o && o.hash != hash) {
            unmatch.push(file);
        }
        if (o && o.hash == hash) {
            match.push(o)
        }
        if (!o) {
            miss.push(o);
        }
    }
    console.log(`${miss.length} 个文件未找到：`);
    console.log(`${match.length} 个文件匹配`);
    console.log(`${unmatch.length} 个文件不匹配：`);
})
