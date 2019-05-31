import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { File, FileEntry, DirectoryEntry, Entry } from "@ionic-native/file/ngx";
import { Platform } from '@ionic/angular';
import { Zip } from '@ionic-native/zip/ngx';
import { ApiService } from './api/api.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppHelper } from '../appHelper';
import { LanguageHelper } from '../languageHelper';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { RequestEntity } from './api/Request.entity';
interface Hcp {
  getHash: (filePath: string) => Promise<string>;
  openHcpPage: (filePath: string) => Promise<any>;
  saveHcpPath: (serverVersion: string) => Promise<any>;
}
interface IMd5JsonFile {
  file: string;
  hash: string;
}
interface IUpdateList {
  Version: {
    DownloadUrl: string;
    Folder: string;
    Value: string;// 版本
    Ignore: boolean;// 是否可以忽略
    Remove: boolean;// 是否清除基础数据,
    Hotfix: {
      DownloadUrl: string;
      Ignore: boolean;// 是否可以忽略
    }
  }[];
}
interface IHcpUpdateModel {
  url: string;
  folder: string;
  serverVersion: string;
  canUpdate: boolean;
  total: number;
  loaded: number;
  taskDesc?: string;
  nativePath?: string;
  unZipComplete?: boolean;
  hcpUpdateComplete?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class FileHelperService {
  readonly updateZipFileName: string = "DongmeiIonic.zip";
  private readonly updateDirectoryName: string = "update";
  private readonly www = "www";
  private readonly md5JsonFileName = "filesHash.json";
  private localVersion: string = AppHelper.isApp() ? null : "1.0.0";
  private serverVersion: string;
  private dataDirectory: string;
  private hcpPlugin: Hcp;
  fileInfo: any = {};
  constructor(
    private webView: WebView,
    private ngZone: NgZone,
    private file: File,
    private httpClient: HttpClient,
    private apiService: ApiService,
    private appVersion: AppVersion,
    private plt: Platform,
    private zip: Zip) {
    this.plt.ready().then(async () => {
      this.hcpPlugin = window['hcp'];
      this.localVersion = await this.getLocalVersionNumber();
      this.fileInfo.dataDrectory = this.file.dataDirectory;
      this.fileInfo.externalDataDirectory = this.file.externalDataDirectory;
      this.fileInfo.cacheDirector = this.file.cacheDirectory;
      this.fileInfo.tempDirectory = this.file.tempDirectory;
      this.fileInfo.documentsDirectory = this.file.documentsDirectory;
      this.fileInfo.syncedDataDirectory = this.file.syncedDataDirectory;
      this.fileInfo.applicationDirectory = this.file.applicationDirectory;
      this.fileInfo.applicationStorageDirectory = this.file.applicationStorageDirectory;
      this.fileInfo.externalApplicationStorageDirectory = this.file.externalApplicationStorageDirectory;
      this.fileInfo.externalRootDirectory = this.file.externalRootDirectory;
      this.logMessage(JSON.stringify(this.fileInfo, null, 2));
      this.dataDirectory = this.file.dataDirectory;
      this.createUpdateWwwDirectory();
    });
  }
  private async createUpdateWwwDirectory() {
    if (!AppHelper.isApp()) {
      return Promise.resolve({});
    }
    try {
      this.plt.ready().then(() => {
        return this.checkDirExists(this.dataDirectory, this.updateDirectoryName);
      }).then(exist => {
        if (!exist) {
          return this.createDir(this.dataDirectory, this.updateDirectoryName);
        }
      });
    } catch (e) {
      this.logError("创建 wwwPath 失败, ", e);
      return Promise.resolve(null);
    }
  }
  private async createDir(path: string, dirName: string) {
    this.logMessage(`开始创建文件夹 ${path}/${dirName}`);
    if (!AppHelper.isApp()) {
      return Promise.resolve({ nativeURL: null } as DirectoryEntry);
    }
    return this.file.createDir(path, dirName, true)
      .then(diren => {
        this.logMessage(`创建文件夹成功${path}/${dirName}`);
        return diren;
      })
      .catch(e => {
        this.logMessage(`创建文件夹失败` + JSON.stringify(e, null, 2));
        return null as DirectoryEntry;
      });
  }
  async openNewVersion(newVersionPagePath: string) {
    return this.hcpPlugin.openHcpPage(newVersionPagePath);
  }
  private async getPackageName() {
    if (!AppHelper.isApp()) {
      return "com.skytrip.dmonline";
    }
    return await this.appVersion.getPackageName();
  }
  private async getServerVersion(onprogress?: (evt: IHcpUpdateModel) => void) {
    this.logMessage(`this.appVersion.getPackageName=${await this.getPackageName()}`);
    const req = new RequestEntity();
    req.Method = "ServiceVersionUrl-Home-Index";
    req.Data = {
      "Product": `${await this.getPackageName()}.${this.plt.is("ios") ? "ios"
        : "android"}`.toLowerCase()
    };
    if (AppHelper.isFunction(onprogress)) {
      onprogress({
        total: 100,
        loaded: 80,
        taskDesc: LanguageHelper.getHcpFetchServerVersionTip()
      } as IHcpUpdateModel);
    }
    return new Promise<IUpdateList>((resolve, reject) => {
      const sub = this.apiService.getResponse<IUpdateList>(req).subscribe(r => {
        if (AppHelper.isFunction(onprogress)) {
          onprogress({
            total: 100,
            loaded: 100,
            taskDesc: LanguageHelper.getHcpFetchServerVersionTip()
          } as IHcpUpdateModel);
        }
        if (r.Status && r.Data) {
          resolve(r.Data);
        } else {
          reject(r.Message);
        }
      }, e => {
        reject(e);
      }, () => {
        if (sub) {
          console.log("sub.unsubscribe()");
          sub.unsubscribe();
        }
      });
    });
  }
  async checkHcpUpdate(test: boolean = false): Promise<{ isHcpCanUpdate: boolean; ignore?: boolean; }> {
    const up = await this.getServerVersion().catch(e => null as IUpdateList);
    if (!up || !up.Version || up.Version.length == 0 || !up.Version[0].Hotfix || !up.Version[0].Hotfix.DownloadUrl) {
      return { isHcpCanUpdate: false };
    }
    this.serverVersion = up.Version[0].Value;
    this.localVersion = await this.getLocalVersionNumber();
    return {
      isHcpCanUpdate: this.checkIfHcpUpdateByVersion(this.serverVersion, this.localVersion),
      ignore: up.Version[0].Hotfix.Ignore
    };
  }
  hcpUpdate(onprogress: (hcp: IHcpUpdateModel) => void): Promise<string> {
    // if (!AppHelper.isApp()) {
    //   return Promise.resolve("");
    // }
    return new Promise<string>(async (resolve, reject) => {
      try {
        await this.plt.ready();
        await this.createUpdateWwwDirectory();
        if (!this.localVersion) {
          this.localVersion = await this.getLocalVersionNumber();
        }
        // await this.listDirFiles(`${this.dataDirectory}`, `${this.updateDirectoryName}`);
        const updateList = await this.getServerVersion(onprogress);
        this.serverVersion = updateList.Version[0].Value;
        // 根据版本判断，是否需要热更新
        const versionUpdate = this.checkIfHcpUpdateByVersion(this.serverVersion, this.localVersion);
        if (!versionUpdate) {
          reject("版本无需热更");
          return false;
        }
        const localExists = this.checkLocalExists(this.serverVersion);
        this.logMessage(`检查本地是否存在服务器热更版本 ${localExists ? "存在" : "不存在"}`);
        if (localExists) {
          resolve("ok");
          return false;
        }
        const hcpRes = updateList.Version[0].Hotfix && updateList.Version[0].Hotfix.DownloadUrl;
        if (!hcpRes) {
          reject("没有热更版本");
        }
        const url = hcpRes;
        const zipFile = await this.downloadZipFile(url, onprogress);
        const f = await this.file.resolveLocalFilesystemUrl(zipFile.nativePath);
        const zp = await this.getParent(f);
        const zipFileExists = await this.checkFileExists(zp.nativeURL, this.updateZipFileName);
        this.logMessage(`zipFile 是否存在 ${zipFileExists ? "存在" : "不存在"}`)
        if (!zipFileExists) {
          // reject(`zipFile是否存在 ${zipFileExists ? "存在" : "不存在"}`)
          // return false;
        }
        const path = `${this.dataDirectory}${this.updateDirectoryName}`;
        const serverVersionDirectory = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
        await this.removeRecursively(path, serverVersionDirectory);
        const direntry = await this.createDir(path, serverVersionDirectory);
        if (!direntry) {
          reject(`${path}/${serverVersionDirectory} 创建失败`);
          return false;
        }
        const unZipOk = !AppHelper.isApp() ? 0 : await this.zip.unzip(zipFile.nativePath, direntry.toInternalURL(), evt => {
          this.ngZone.run(() => {
            onprogress({
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: LanguageHelper.getHcpUnZipTip()
            } as IHcpUpdateModel);
          });
        });
        if (unZipOk !== 0) {
          reject(`解压文件失败`);
          return false;
        }
        // const checkResult = await this.checkUnZipFilesMd5(onprogress);
        // if (!checkResult) {
        //   reject(`文件校验失败`);
        //   this.logMessage(`文件校验失败`);
        //   return false;
        // }
        const vpPath = `${path}/${serverVersionDirectory}/${this.www}/index.html`;
        this.logMessage(`webView.convertFileSrc=${this.webView.convertFileSrc(vpPath)}`);
        const saveOk = await this.hcpPlugin.saveHcpPath(this.webView.convertFileSrc(vpPath))
          .then(_ => true)
          .catch(_ => false);
        if (!saveOk) {
          this.logMessage(`saveHcpPath 失败`);
          reject("热更失败");
          return false;
        }
        this.cacheHcpVersionToLoacal(this.serverVersion);
        // await this.listDirFiles(this.dataDirectory, this.updateDirectoryName);
        await this.clearUnUseVersions();
        await this.listDirFiles(this.dataDirectory, this.updateDirectoryName);
        resolve(this.webView.convertFileSrc(vpPath));
      } catch (e) {
        this.logMessage(`热更失败 ${JSON.stringify(e, null, 2)}`);
        reject(e);
        return false;
      }
    });
  }
  private async getLocalVersionNumber() {
    if (!AppHelper.isApp()) {
      return `1.0.0`;
    }
    return await this.appVersion.getVersionNumber();
  }
  private async clearUnUseVersions(serverVersion: string = "") {
    try {
      serverVersion = serverVersion || this.serverVersion;
      const path = `${this.dataDirectory}${this.updateDirectoryName}`;
      // 列出 update 下面的文件夹
      const versionFiles = await this.listDirFiles(this.dataDirectory, this.updateDirectoryName);
      const curUsingVersionDir = `${this.www}_${this.getLocalHcpVersion()}`.replace(/\./g, "_");
      for (let i = 0; i < versionFiles.length; i++) {
        const versionDir = versionFiles[i].name;
        this.logMessage(`${this.updateDirectoryName}/${versionDir}`);
        if (versionDir === curUsingVersionDir) {
          continue;
        }
        await this.removeRecursively(path, versionDir);
      }
    } catch (e) {
      this.logMessage(`clearUnUseVersions error ${JSON.stringify(e, null, 2)}`);
    }
  }
  private getLocalHcpVersion() {
    this.logMessage(`apphcpversion=${AppHelper.getStorage<string>("apphcpversion")}`);
    return (AppHelper.getStorage<string>("apphcpversion") || "").trim();
  }
  private cacheHcpVersionToLoacal(version: string) {
    AppHelper.setStorage('apphcpversion', version);
  }
  private async getMd5JsonFile() {
    const path = `${this.dataDirectory}${this.updateDirectoryName}`;
    const versionDir = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
    const json = await this.readFileAsString(`${path}/${versionDir}/${this.www}`, this.md5JsonFileName);
    if (json) {
      return JSON.parse(json) as IMd5JsonFile[];
    }
    return "";
  }
  private downloadZipFile(url: string, onprogress: (hcp: IHcpUpdateModel) => void) {
    return new Promise<IHcpUpdateModel>((resove, rejcet) => {
      const sub = this.httpClient.get(url, {
        observe: "events",
        responseType: "arraybuffer",
        reportProgress: true
      })
        .subscribe(async (evt: any) => {
          if (evt.total) {
            this.logMessage(`正在下载zip文件 ${Math.floor(evt.loaded / evt.total * 100).toFixed(2)}%`);
            onprogress({
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: LanguageHelper.getHcpDownloadingTip()
            } as IHcpUpdateModel);
          }
          if (evt instanceof HttpResponse) {
            const fileEntry = await this.createFile(`${this.dataDirectory}${this.updateDirectoryName}`, this.updateZipFileName, true);
            if (!fileEntry) {
              rejcet(`【${this.updateZipFileName}】文件创建失败`);
              return;
            }
            fileEntry.createWriter(fw => {
              fw.onerror = err => {
                rejcet(err);
              };
              fw.onprogress = fwevt => {
                onprogress({
                  total: fwevt.total,
                  loaded: fwevt.loaded,
                  taskDesc: LanguageHelper.getWritingFileTip()
                } as IHcpUpdateModel);
              };
              fw.onwriteend = fwevt => {
                this.logMessage(`【${this.updateZipFileName}】写入本地已经完成,${fileEntry.toURL()}`);
                resove({
                  hcpUpdateComplete: true,
                  nativePath: fileEntry.toURL()
                } as IHcpUpdateModel);
              }
              fw.write(evt.body);
            });
          }
        }, e => {
          rejcet(e);
        }, () => {
          if (sub) {
            sub.unsubscribe();
          }
        });
    });
  }
  private logMessage(msg: string, data?: any) {
    try {
      if (data) {
        console.log(`${msg}，${JSON.stringify(data, null, 2)}`);
      } else {
        console.log(`${msg}`);
      }
    } catch (e) {
      console.log(`logMessage,${JSON.stringify(e, null, 2)}`);
    }
  }
  private logError(msg: string, err: any) {
    try {
      if (err) {
        console.log(`${msg},error: ${JSON.stringify(err, null, 2)}`);
      } else {
        console.log(`${msg}`);
      }
    } catch (e) {
      console.log(`logError,${JSON.stringify(e, null, 2)}`);
    }
  }
  /**
   *  检查 服务器版本是否已经下载到本地，或者，本地是否存在一个有效的服务器版本
   *  // path/www_1_1_0
   * @param serverVersion 
   */
  private checkLocalExists(serverVersion: string) {
    if (!AppHelper.isApp()) {
      return false;
    }
    return serverVersion == this.getLocalHcpVersion();
  }
  private removeFile(path: string, file: string) {
    this.logMessage(`删除文件${path}/${file}`);
    return this.file.removeFile(path, file).catch(e => {
      this.logMessage(`删除文件${path}/${file}失败，${JSON.stringify(e, null, 2)}`);
      return {
        success: false,
        fileRemoved: []
      };
    })
  }
  private listDirFiles(path: string, dir: string) {
    if (!AppHelper.isApp()) {
      return Promise.resolve([] as Entry[]);
    }
    return this.file.listDir(path, dir).then(en => {
      this.logMessage(`列出文件夹${path}/${dir}下面的所有文件：`);
      en.forEach(item => {
        this.logMessage(`【${item.name}】`);
      });
      return en;
    }).catch(e => {
      this.logMessage(`列出文件夹${path}/${dir}下面的所有文件抛出异常` + JSON.stringify(e, null, 2));
      return [] as Entry[];
    });
  }

  private clearVersionDirectory(version: string) {
    const path = `${this.dataDirectory}${this.updateDirectoryName}`;
    const versionDir = `${this.www}_${version}`.replace(/\./g, "_");
    this.logMessage(`开始删除版本${version},${path} / ${versionDir}`);
    return this.removeRecursively(path, versionDir).then(r => {
      this.logMessage(`完成删除版本${version},${path} / ${versionDir}`);
      return r;
    });
  }
  private createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry> {
    if (!AppHelper.isApp()) {
      return Promise.resolve(null);
    }
    this.logMessage(`创建文件${path}  /  ${fileName}`);
    return this.file.createFile(path, fileName, replace).catch(e => {
      this.logMessage(`创建文件失败${JSON.stringify(e, null, 2)}`);
      return null as FileEntry;
    });
  }
  /**
   *  递归删除文件夹下面的所有文件，以及文件夹本身
   * @param path 
   * @param directoryName 
   */
  private removeRecursively(path: string, directoryName: string) {
    if (!AppHelper.isApp()) {
      return Promise.resolve({} as {
        success: false,
        fileRemoved: null
      });
    }
    this.logMessage(`开始递归删除文件夹 ${path}/${directoryName}`);
    return this.file.removeRecursively(path, directoryName)
      .catch(e => {
        this.logMessage(`递归删除文件夹失败: ` + JSON.stringify(e, null, 2));
        return Promise.resolve({
          success: false,
          fileRemoved: null
        });
      });
  }
  /**
   *  
   * @param serverVersion 服务器版本
   * @param localVersion  当前运行的版本
   * @returns 返回 true 表示要更新，false不需要更新 
   */
  private checkIfHcpUpdateByVersion(serverVersion: string, localVersion: string) {
    this.logMessage(`比较热更版本 server:${serverVersion} <===> localversion ${localVersion}`);
    if (!serverVersion || !localVersion) {
      return false;
    }
    const sVs = serverVersion.split(".");
    const lVs = localVersion.split(".");
    if (sVs.length !== lVs.length) {
      return false;
    }
    const smain = sVs[0];
    const sMinor = sVs[1];
    const sPatch = sVs[sVs.length - 1];
    const lmain = lVs[0];
    const lMinor = lVs[1];
    const lPatch = lVs[sVs.length - 1];
    return smain == lmain && sMinor == lMinor && sPatch != lPatch;
  }
  /**
 *  
 * @param serverVersion 服务器版本
 * @param localVersion  当前运行的版本
 * @returns 返回 true 表示要更新，false不需要更新 
 */
  private checkIfUpdateAppByVersion(serverVersion: string, localVersion: string) {
    if (!serverVersion || !localVersion) {
      return true;
    }
    const sVs = serverVersion.split(".");
    const lVs = localVersion.split(".");
    if (sVs.length !== lVs.length) {
      return true;
    }
    const smain = sVs[0];
    const sMinor = sVs[1];
    const lmain = lVs[0];
    const lMinor = lVs[1];
    // 主版本不等或者次版本不等
    return smain != lmain || sMinor != lMinor;
  }
  private checkFileExists(path: string, fileName: string): Promise<boolean> {
    if (!AppHelper.isApp()) {
      return Promise.resolve(true);
    }
    this.logMessage(`检查文件 ${path}/${fileName} 是否存在`);
    return this.file.checkFile(path, fileName)
      .then(en => {
        this.logMessage(`文件 ${path}/${fileName}【存在】`);
        return en;
      })
      .catch(e => {
        this.logMessage(`文件 ${path}/${fileName}【~~不存在~~】${JSON.stringify(e, null, 2)}`);
        // this.logMessage(`检查文件${path}/${fileName} 是否存在出现异常 ${JSON.stringify(e, null, 2)}`);
        return false;
      });
  }
  private checkDirExists(path: string, dirName: string) {
    this.logMessage(`检查路径${path} / ${dirName}是否存在`);
    return this.file.checkDir(path, dirName)
      .then(_ => {
        this.logMessage(`路径${path}/${dirName}【存在】`);
        return true;
      }).catch(e => {
        this.logMessage(`路径${path}/${dirName}【不存在】${JSON.stringify(e, null, 2)}`);
        return false;
      });
  }
  private async checkUnZipFilesMd5(onprogress: (hcp: IHcpUpdateModel) => void) {
    if (!AppHelper.isApp()) {
      return Promise.resolve(true);
    }
    try {
      const md5JsonFile = await this.getMd5JsonFile();
      // this.logMessage(`md5jsonFile,${JSON.stringify(md5JsonFile)}`);
      if (!md5JsonFile) {
        return false;
      }
      const path = `${this.dataDirectory}${this.updateDirectoryName}`;
      const versionDir = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
      let files = await this.getDirectoryFilesRecursively(`${path}/${versionDir}`, this.www, []);
      this.logMessage(`解压后的总文件数量：${files.length}个，md5JsonFile记录${md5JsonFile.length}个文件`);
      files = files.filter(item => !item.toURL().includes(".zip") && !item.toURL().includes(this.md5JsonFileName));// 调试阶段多了一个zip文件
      this.logMessage(`-----------${md5JsonFile.length}】个原始文件与${files.length}个解压文件进行校验-----------`);
      if (files.length !== md5JsonFile.length) {
        this.logMessage(`文件数量不一致，完整性校验失败`);

        return false;
      }
      const checkMd5Failures: {
        file: string;
        md5: string;
        downloadMd5: string;
        err: string;
      }[] = [];
      for (let i = 0; i < files.length; i++) {
        onprogress({
          total: files.length,
          loaded: i + 1,
          taskDesc: LanguageHelper.getHcpValidatingFileTip()
        } as IHcpUpdateModel);
        const f = files[i];
        const dirEntry = await this.getParent(f);
        if (!dirEntry) {
          checkMd5Failures.push({
            file: f.toURL(),
            md5: null,
            downloadMd5: null,
            err: "文件所在目录不存在"
          });
          continue;
        }
        // 路径从www目录开始计算
        // 比如Android中，
        // file:///data/user/0/com.skytrip.dmonline/files/update/www_1_0_1/www/assets/images/call_center_hot_problem_hotel_scene_icon.png
        const filePath = f.toURL().substring(f.toURL().indexOf('www/') + "www/".length);
        const originFile = md5JsonFile.find(item => item.file == filePath);
        if (!originFile) {
          checkMd5Failures.push({
            file: f.toURL(),
            md5: null,
            downloadMd5: null,
            err: `md5JsonFile 找不到对应的文件 ${filePath}`
          });
          continue;
        }
        const origiFileMd5 = originFile.hash;
        const path = dirEntry.toInternalURL().endsWith("/") ? dirEntry.toInternalURL()
          .substring(0, dirEntry.toInternalURL().lastIndexOf("/")) : dirEntry.toInternalURL();
        const donwloadmd5 = await this.getFileMd5(path, f.name);
        if (!donwloadmd5) {
          checkMd5Failures.push({
            file: f.toURL(),
            md5: null,
            downloadMd5: null,
            err: `${f.name}文件md5计算出错`
          });
          continue;
        }
        if (origiFileMd5 !== donwloadmd5) {
          checkMd5Failures.push({
            file: f.toURL(),
            md5: origiFileMd5,
            downloadMd5: donwloadmd5,
            err: `文件【${f.name}】和原始文件【${originFile.file}】的md5校验失败`
          });
        }
      }
      this.logMessage(`-----------完成文件校验-----------`);
      this.logMessage(`总共有${checkMd5Failures.filter(item => !item.downloadMd5 || !item.md5).length}个文件md5不存在`);
      this.logMessage(`总共校验${files.length}个文件，其中${checkMd5Failures.length}个校验失败，校验详细结果:${JSON.stringify(checkMd5Failures, null, 2)}`);
      return checkMd5Failures.length === 0;
    } catch (e) {
      this.logMessage(`文件校验异常${JSON.stringify(e, null, 2)}`);
      return false;
    }
  }

  private readFileAsString(path: string, file: string) {
    return this.file.readAsText(path, file).catch(() => "");
  }
  private getParent(f: Entry) {
    return new Promise<DirectoryEntry>((s, rej) => {
      f.getParent(dirEntry => {
        s(dirEntry);
      }, err => {
        this.logMessage(`f entry getParent 失败${JSON.stringify(err, null, 2)}`);
        s(null);
      });
    });
  }
  private async getFileMd5(path: string, file: string) {
    if (this.hcpPlugin) {
      return await this.hcpPlugin.getHash(`${path}/${file}`).catch(e => {
        this.logError(`getFileMd5 计算${file} hash 出错`, e);
        return "";
      });
    }
    return "";
  }
  private async getDirectoryFilesRecursively(path: string, dir: string, entries: Entry[]) {
    const tempEntry = await this.getDirectoryFiles(path, dir);
    for (let i = 0; i < tempEntry.length; i++) {
      const item = tempEntry[i];
      if (item.isFile) {
        entries.push(item);
      } else {
        const p = await this.getParent(item);
        // this.logMessage(`读取目录${p.toURL()},【${item.name}】下的文件`);
        const itemPath = p.toURL().endsWith("/") ? p.toURL().substring(0, p.toURL().lastIndexOf('/')) : p.toURL();
        // this.logMessage(`【${item.name}】有${(await this.file.listDir(itemPath, item.name)).length}个文件【${item.isDirectory ? "夹" : ""}】`);
        await this.getDirectoryFilesRecursively(`${itemPath}`, item.name, entries);
      }
    }
    // this.logMessage(`entries当前大小：${entries.length}个文件`);
    return entries;
  }
  private async getDirectoryFiles(path: string, dir: string) {
    try {
      const files = await this.file.listDir(path, dir);
      return files;
    } catch (e) {
      this.logMessage(`读取目录【${dir}】 下的文件异常,: ${JSON.stringify(e, null, 2)}`);
      return [];
    }
  }
}
