const path = require("path");
const fs = require("fs");
const fread = require("fs-readdir-recursive");
const crypto = require("crypto");
function hashFile(filename, success) {
    return new Promise(function (s) {
        var hash = crypto.createHash("md5"),
            stream = fs.createReadStream(filename);
        //stream.pipe(writeStream);
        //console.log('Hashing: ', filename);
        stream.on("data", function (data) {
            hash.update(data, "utf8");
        });
        stream.on("end", function () {
            const result = hash.digest("hex");
            s(result);
            if (success) {
                success(result)
            }
        });
    });
}
function getConfigxmlId() {
    let id = '';
    const config = fs.readFileSync(path.join(__dirname, '../config.xml'), { encoding: "utf8" });
    if (config) {
        const res = config.match(/id=\w?.+ version/ig);
        if (res && res[0] && res[0].includes("=")) {
            id = res[0].split('=')[1].replace(/"/gi, '');
            id = id.replace('version', '').trim();
        }
        console.log(id);
    }
    return id;
}
const zipfile = path.join(__dirname, '../' + getConfigxmlId() + ".ios.zip");
if (fs.existsSync(zipfile)) {
    console.log('zipfile', zipfile);
    hashFile(zipfile, hash => {
        console.log('hash file', hash);
        if (hash) {
            fs.renameSync(zipfile, zipfile.replace("ios.", "ios." + hash + "."));
        }
    })
}