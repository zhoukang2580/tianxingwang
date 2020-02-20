import { finalize } from "rxjs/operators";
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { File, FileEntry, DirectoryEntry, Entry } from "@ionic-native/file/ngx";
import { Platform } from "@ionic/angular";
import { Zip } from "@ionic-native/zip/ngx";
import { ApiService } from "./api/api.service";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { RequestEntity } from "./api/Request.entity";
import { App } from "../app.component";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
interface Hcp {
  getHash: (filePath: string) => Promise<string>;
  getUUID: () => Promise<string>;
  openHcpPage: (filePath: string) => Promise<any>;
  saveHcpPath: (serverVersion: string) => Promise<any>;
  openAPK: (apkFilePath: string) => Promise<any>; // 仅Android可用
  loadHcpPage: () => Promise<any>; // 仅Android可用
  checkPathOrFileExists: (filePath: string) => Promise<void>;
}
interface IMd5JsonFile {
  file: string;
  hash: string;
}
interface IUpdateList {
  DownloadUrl: string;
  Md5: string;
  ApkDownloadUrl: string;
  ApkMd5: string;
  Version: string; // "2.0";
  Ignore: boolean;
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
  providedIn: "root"
})
export class FileHelperService {
  app: App;
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
    private splashScreen: SplashScreen,
    private zip: Zip
  ) {
    this.plt.ready().then(async () => {
      this.hcpPlugin = window["hcp"];
      this.app = navigator["app"];
      // if (AppHelper.isApp()) {
      //   if (this.plt.is('android')) {
      //     this.splashScreen.show();
      //     this.hcpPlugin.loadHcpPage();
      //   }
      //   this.splashScreen.hide();
      //   this.logMessage(`uuid = ${await AppHelper.getDeviceId()}`);
      // }
      this.dataDirectory = this.file.dataDirectory;
      // if(this.plt.is("ios")&&window['cordova'].file){
      //   this.dataDirectory=window['cordova'].file.dataDirectory;
      // }
      document.addEventListener("resume", () => this.onResume(), false);
      await this.clearLocalHcpVersionIfAppUpdated();
      this.localVersion = await this.getLocalVersionNumber();
      this.fileInfo.dataDrectory = this.dataDirectory;
      this.fileInfo.externalDataDirectory = this.file.externalDataDirectory;
      this.fileInfo.cacheDirector = this.file.cacheDirectory;
      this.fileInfo.tempDirectory = this.file.tempDirectory;
      this.fileInfo.documentsDirectory = this.file.documentsDirectory;
      this.fileInfo.syncedDataDirectory = this.file.syncedDataDirectory;
      this.fileInfo.applicationDirectory = this.file.applicationDirectory;
      this.fileInfo.applicationStorageDirectory = this.file.applicationStorageDirectory;
      this.fileInfo.externalApplicationStorageDirectory = this.file.externalApplicationStorageDirectory;
      this.fileInfo.externalRootDirectory = this.file.externalRootDirectory;
      // this.logMessage(JSON.stringify(this.fileInfo, null, 2));
      this.createUpdateWwwDirectory();
    });
  }

  private reloadHcpPage() {
    const hcp = window["hcp"];
    if (hcp) {
      hcp.loadHcpPage();
    }
  }
  private onResume() {
    setTimeout(() => {
      this.reloadHcpPage();
    }, 0);
  }
  private async clearLocalHcpVersionIfAppUpdated() {
    if (AppHelper.isApp()) {
      const curRunningVersionStr = await this.getLocalVersionNumber();
      this.logMessage(
        `clearLocalHcpVersionIfAppUpdated,手机上正在运行的版本=${curRunningVersionStr}`
      );
      const hcpVersionStr = this.getLocalHcpVersion();
      this.logMessage(
        `clearLocalHcpVersionIfAppUpdated,hcpVersionStr=${hcpVersionStr}`
      );
      if (curRunningVersionStr && hcpVersionStr) {
        const curRunningVersion = curRunningVersionStr.split(".");
        curRunningVersion.pop();
        const hcpVersion = hcpVersionStr.split(".");
        hcpVersion.pop();
        if (hcpVersion.join("_") !== curRunningVersion.join("_")) {
          this.logMessage(
            `clearLocalHcpVersionIfAppUpdated app 已经安装了新版本，本地hcp版本记录清空`
          );
          this.setHcpVersionToLoacal("");
          await this.hcpPlugin.saveHcpPath("").catch(_ => {
            this.logMessage(`clearLocalHcpVersionIfAppUpdated,保存路径失败`, _);
          });
        }
      } else {
        this.logMessage("尚不存在hcpversion 或者本地运行版本get 不到");
      }
    }
  }
  private async createUpdateWwwDirectory() {
    await this.plt.ready();
    if (!AppHelper.isApp()) {
      return Promise.resolve({});
    }
    try {
      this.plt
        .ready()
        .then(() => {
          return this.checkDirExists(
            this.dataDirectory,
            this.updateDirectoryName
          );
        })
        .then(exist => {
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
    await this.plt.ready();
    this.logMessage(`开始创建文件夹 ${path}/${dirName}`);
    if (!AppHelper.isApp()) {
      return Promise.resolve({ nativeURL: null } as DirectoryEntry);
    }
    return this.file
      .createDir(path, dirName, true)
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
    return this.appVersion.getPackageName();
  }
  private async getServerVersion(onprogress?: (evt: IHcpUpdateModel) => void) {
    this.logMessage(
      `this.appVersion.getPackageName=${await this.getPackageName()}`
    );
    const req = new RequestEntity();
    req.Method = "ServiceVersionUrl-Home-Index";
    const pkgName = await this.getPackageName();
    req["type"] = "loadjson";
    req.Data = {
      Name: `${pkgName}.${this.plt.is("ios") ? "ios" : "android"}`.toLowerCase()
    };
    if (AppHelper.isFunction(onprogress)) {
      onprogress({
        total: 100,
        loaded: 80,
        taskDesc: LanguageHelper.getHcpFetchServerVersionTip()
      } as IHcpUpdateModel);
    }
    return new Promise<IUpdateList>((resolve, reject) => {
      const sub = this.apiService.getResponse<string>(req).subscribe(
        r => {
          if (AppHelper.isFunction(onprogress)) {
            onprogress({
              total: 100,
              loaded: 100,
              taskDesc: LanguageHelper.getHcpFetchServerVersionTip()
            } as IHcpUpdateModel);
          }
          if (r.Status && r.Data) {
            resolve(JSON.parse(r.Data));
          } else {
            reject(r.Message);
          }
        },
        e => {
          reject(e);
        },
        () => {
          if (sub) {
            console.log("sub.unsubscribe()");
            sub.unsubscribe();
          }
        }
      );
    });
  }
  async checkHcpUpdate(
    test: boolean = false
  ): Promise<{ isHcpCanUpdate: boolean; ignore?: boolean }> {
    await this.plt.ready();
    const up = await this.getServerVersion().catch(e => null as IUpdateList);
    if (!up || !up.Version) {
      return { isHcpCanUpdate: false };
    }
    this.serverVersion = up.Version;
    this.localVersion = await this.getLocalVersionNumber();
    return {
      isHcpCanUpdate: this.checkIfHcpUpdateByVersion(
        this.serverVersion,
        this.localVersion
      ),
      ignore: up.Ignore
    };
  }
  private async checkHcpZipFileMd5(
    serverHcpMd5: string,
    downloadedZipFilePath: string
  ) {
    if (!serverHcpMd5 || !downloadedZipFilePath) {
      return Promise.resolve(false);
    }
    const hash = await this.hcpPlugin
      .getHash(downloadedZipFilePath)
      .catch(_ => "");
    return hash == serverHcpMd5;
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
        const update = await this.getServerVersion(onprogress);
        this.serverVersion = update.Version;
        // 根据版本判断，是否需要热更新
        const versionUpdate = this.checkIfHcpUpdateByVersion(
          this.serverVersion,
          this.localVersion
        );
        if (!versionUpdate) {
          reject("版本无需热更");
          return false;
        }
        const localExists = this.checkLocalExists(this.serverVersion);
        this.logMessage(
          `检查本地是否存在服务器热更版本 ${localExists ? "存在" : "不存在"}`
        );
        if (localExists) {
          resolve("ok");
          return false;
        }
        const hcpRes = update.DownloadUrl;
        const hcpMd5 = update.Md5;
        if (!hcpRes) {
          reject("没有热更版本");
        }
        const url = `${hcpRes}?v=${Date.now()}`;
        this.logMessage(`下载的热更zip 文件URL ${url}`);
        const zipFile = await this.downloadZipFile(url, onprogress).catch(_ => {
          this.logMessage(`zipFile 异常 ${url}`);
          return null;
        });
        const f = await this.getFileEntry(zipFile.nativePath);
        const zp = await this.getParent(f);
        const zipFileExists = await this.checkPathFileExists(
          zp.nativeURL,
          this.updateZipFileName
        );
        this.logMessage(
          `zipFile 是否存在 ${zipFileExists ? "存在" : "不存在"}`
        );
        if (!zipFileExists) {
          reject(`zipFile是否存在 ${zipFileExists ? "存在" : "不存在"}`);
          return false;
        }
        const isHashMatch = await this.checkHcpZipFileMd5(
          hcpMd5,
          zipFile.nativePath
        );
        if (!isHashMatch) {
          reject(`更新失败，文件已损坏`);
          this.removeFile(zp.nativeURL, this.updateZipFileName).catch(_ => {
            console.error(_);
          });
          return false;
        }
        const path = `${this.dataDirectory}${this.updateDirectoryName}`;
        const serverVersionDirectory = `${this.www}_${this.serverVersion}`.replace(
          /\./g,
          "_"
        );
        await this.removeRecursively(path, serverVersionDirectory);
        const direntry = await this.createDir(path, serverVersionDirectory);
        if (!direntry) {
          reject(`${path}/${serverVersionDirectory} 创建失败`);
          return false;
        }
        const unZipOk = !AppHelper.isApp()
          ? 0
          : await this.zip.unzip(
              zipFile.nativePath,
              direntry.toInternalURL(),
              evt => {
                this.ngZone.run(() => {
                  onprogress({
                    total: evt.total,
                    loaded: evt.loaded,
                    taskDesc: LanguageHelper.getHcpUnZipTip()
                  } as IHcpUpdateModel);
                });
              }
            );
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
        await this.changeIndexPageBaseHref(vpPath);
        this.logMessage(
          `webView.convertFileSrc=${this.webView.convertFileSrc(vpPath)}`
        );
        const saveOk = await this.hcpPlugin
          .saveHcpPath(this.webView.convertFileSrc(vpPath))
          .then(_ => true)
          .catch(_ => false);
        if (!saveOk) {
          this.logMessage(`saveHcpPath 失败`);
          reject("热更失败");
          return false;
        }
        this.setHcpVersionToLoacal(this.serverVersion);
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
  private async getFileEntry(filePath: string) {
    if (!AppHelper.isApp()) {
      return Promise.resolve({} as Entry);
    }
    return await this.file.resolveLocalFilesystemUrl(filePath).catch(e => {
      this.logError(`getFileEntry,resolveLocalFilesystemUrl`, e);
      return {} as Entry;
    });
  }
  private async changeIndexPageBaseHref(indexHtmlFilePath: string) {
    const f = await this.getFileEntry(indexHtmlFilePath);
    const indexHtmlFileParent = await this.getParent(f);
    let indexHtml = await this.readFileAsString(
      indexHtmlFileParent.nativeURL,
      f.name
    );
    if (!indexHtml) {
      this.logError(`indexhtml 文件不存在，热更失败`, indexHtml);
      throw new Error(`indexhtml 文件不存在，热更失败`);
    }
    console.log(
      `this.webView.convertFileSrc(indexHtmlFileParent.nativeURL)=${this.webView.convertFileSrc(
        indexHtmlFileParent.nativeURL
      )}`
    );
    const androidLocalPath = `${this.webView.convertFileSrc(
      indexHtmlFileParent.nativeURL
    )}`.replace("http://localhost", "");
    const iosLocalPath = `${this.webView.convertFileSrc(
      indexHtmlFileParent.nativeURL
    )}`.replace("ionic://localhost", "");
    indexHtml = indexHtml.replace(
      /base href="\/"/,
      `base href="${this.plt.is("ios") ? iosLocalPath : androidLocalPath}"`
    );
    this.logMessage(`修改后的html 文件`, indexHtml);
    await this.writeContentToFile(
      indexHtmlFileParent.nativeURL,
      f.name,
      indexHtml,
      evt => {
        this.logMessage(
          `正在写入index.html文件 ${(
            (100 * evt.loaded) /
            (evt.total || 1)
          ).toFixed(2)}%`
        );
      }
    );
    indexHtml = await this.readFileAsString(
      indexHtmlFileParent.nativeURL,
      f.name
    );
    this.logMessage(`index.html 文件写入完成，内容`, indexHtml);
  }
  private async getLocalVersionNumber() {
    await this.plt.ready();
    if (!AppHelper.isApp()) {
      return `3.1.0`;
    }
    return this.appVersion.getVersionNumber();
  }
  private async clearUnUseVersions(serverVersion: string = "") {
    try {
      serverVersion = serverVersion || this.serverVersion;
      const path = `${this.dataDirectory}${this.updateDirectoryName}`;
      // 列出 update 下面的文件夹
      const versionFiles = await this.listDirFiles(
        this.dataDirectory,
        this.updateDirectoryName
      );
      const curUsingVersionDir = `${
        this.www
      }_${this.getLocalHcpVersion()}`.replace(/\./g, "_");
      const downloadedLatestApk =
        `${this.serverVersion}`.replace(/\./g, "_") + ".apk";
      for (let i = 0; i < versionFiles.length; i++) {
        const versionDir = versionFiles[i].name;
        this.logMessage(`${this.updateDirectoryName}/${versionDir}`);
        // apk不要删除
        if (
          versionDir === curUsingVersionDir ||
          versionDir === downloadedLatestApk
        ) {
          continue;
        }
        await this.removeRecursively(path, versionDir);
      }
    } catch (e) {
      this.logMessage(`clearUnUseVersions error ${JSON.stringify(e, null, 2)}`);
    }
  }
  getLocalHcpVersion() {
    const hcpVersion = (
      AppHelper.getStorage<string>("apphcpversion") || ""
    ).trim();
    this.logMessage(`getStorage 热更后存储在本地的版本=${hcpVersion}`);
    return hcpVersion;
  }
  private setHcpVersionToLoacal(version: string) {
    AppHelper.setStorage("apphcpversion", version);
  }
  private async getMd5JsonFile() {
    const path = `${this.dataDirectory}${this.updateDirectoryName}`;
    const versionDir = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
    const json = await this.readFileAsString(
      `${path}/${versionDir}/${this.www}`,
      this.md5JsonFileName
    );
    if (json) {
      return JSON.parse(json) as IMd5JsonFile[];
    }
    return "";
  }

  /**
   * 下载文件
   * @param url 下载文件的服务器地址
   * @param destFilePathDir 下载到本地的文件夹路径
   * @param fileName 文件名称
   * @param onprogress 下载进度回调函数
   */
  private downLoadFile(
    url: string,
    destFilePathDir: string,
    fileName: string,
    onprogress: (hcp: IHcpUpdateModel) => void
  ) {
    if (AppHelper.isApp() && this.plt.is("ios")) {
      return new Promise<IHcpUpdateModel>(async (resolve, reject) => {
        const result = await this.download(
          `${destFilePathDir}/${fileName}`,
          url,
          evt => {
            if (evt.lengthComputable) {
              if (onprogress) {
                onprogress({
                  total: evt.total,
                  loaded: evt.loaded,
                  taskDesc: LanguageHelper.getFileDownloadingTip()
                } as IHcpUpdateModel);
              }
            }
          }
        ).catch(_ => {
          reject(_);
          return null;
        });
        resolve({
          hcpUpdateComplete: true,
          nativePath: result
        } as IHcpUpdateModel);
      });
    }
    return new Promise<IHcpUpdateModel>((resolve, reject) => {
      const sub = this.httpClient
        .get(url, {
          observe: "events",
          responseType: "arraybuffer",
          reportProgress: true
        })
        .subscribe(
          async (evt: any) => {
            this.logMessage("evt", evt);
            if (evt.total) {
              this.logMessage(
                `正在下载文件 ${Math.floor(
                  (evt.loaded / evt.total) * 100
                ).toFixed(2)}% evt.body=`,
                evt.body
              );
              onprogress({
                total: evt.total,
                loaded: evt.loaded,
                taskDesc: LanguageHelper.getFileDownloadingTip()
              } as IHcpUpdateModel);
            }
            if (AppHelper.isApp()) {
              if (this.plt.is("ios")) {
                if (evt.body && evt.status == 200 && evt.type == 4) {
                  const result = await this.writeContentToFile(
                    destFilePathDir,
                    fileName,
                    evt.body,
                    onprogress
                  ).catch(e => {
                    reject(e);
                    return null as IHcpUpdateModel;
                  });
                  this.logMessage("result ", result);
                  if (result) {
                    resolve(result);
                  }
                } else {
                  // reject(evt.statusText);
                }
              }
              if (this.plt.is("android")) {
                if (evt instanceof HttpResponse) {
                  const result = await this.writeContentToFile(
                    destFilePathDir,
                    fileName,
                    evt.body,
                    onprogress
                  ).catch(e => {
                    reject(e);
                    return null as IHcpUpdateModel;
                  });
                  if (result) {
                    resolve(result);
                  }
                }
              }
            } else {
              if (evt.body && evt.status == 200 && evt.type == 4) {
                console.log(evt);
                resolve({
                  hcpUpdateComplete: true,
                  nativePath: ``
                } as IHcpUpdateModel);
              }
            }
          },
          e => {
            if (e instanceof HttpErrorResponse) {
              reject("网络错误或资源不存在," + e.message);
            } else {
              reject(e);
            }
          },
          () => {
            if (sub) {
              sub.unsubscribe();
            }
          }
        );
    });
  }
  private writeContentToFile(
    destFilePathDir: string,
    fileName: string,
    data: ArrayBuffer | any,
    onprogress: (evt: IHcpUpdateModel) => void
  ) {
    return new Promise<IHcpUpdateModel>(async (resove, reject) => {
      this.logMessage(
        "data is of  type ArrayBuffer ",
        data instanceof ArrayBuffer
      );
      this.logMessage("data.byteLength", data && data.byteLength);
      if (this.plt.is("ios")) {
        this.logMessage(
          "ios destFilePathDir",
          `${destFilePathDir}/${fileName}`
        );
        const writeFile = await this.file
          .writeFile(destFilePathDir, fileName, data, { replace: true })
          .then(_ => {
            this.logMessage("ios 写入文件成功", _);
            return true;
          })
          .catch(_ => {
            this.logMessage("ios 写入文件失败");
            return false;
          });
        const check = await this.file
          .checkFile(destFilePathDir, fileName)
          .catch(_ => {
            this.logError("ios check file error ", _);
            return false;
          });
        this.logMessage(`结果，writeFile=${writeFile},checkfile=${check}`);
        if (check) {
          resove({
            hcpUpdateComplete: true,
            nativePath: `${
              destFilePathDir.endsWith("/")
                ? destFilePathDir
                : destFilePathDir + "/"
            }${fileName}`
          } as IHcpUpdateModel);
        } else {
          reject("文件写入失败");
        }
      } else {
        const fileEntry = await this.createFile(
          destFilePathDir,
          fileName,
          true
        );
        this.logMessage("writeContentToFile", fileEntry);
        if (!fileEntry) {
          reject(`【${this.updateZipFileName}】文件创建失败`);
          return;
        }
        fileEntry.createWriter(fw => {
          if (!fw) {
            reject("filewrter 创建失败");
            return;
          }
          this.logMessage("writeContentToFile", typeof fw);
          fw.onabort = fwabortevt => {
            this.logMessage(`fwabortevt`, fwabortevt);
          };
          fw.onwritestart = startevt => {
            this.logMessage(`onwritestart`, startevt);
          };
          fw.onerror = err => {
            this.logMessage(`【${fileName}】写入本地失败`, err);
            reject(err);
          };
          fw.onprogress = fwevt => {
            this.logMessage("正在写入文件", fwevt.loaded / fwevt.total);
            onprogress({
              total: fwevt.total,
              loaded: fwevt.loaded,
              taskDesc: LanguageHelper.getWritingFileTip()
            } as IHcpUpdateModel);
          };
          fw.onwriteend = fwevt => {
            this.logMessage(
              `【${fileName}】写入本地已经完成,文件的路径：${fileEntry.toURL()}`
            );
            resove({
              hcpUpdateComplete: true,
              nativePath: fileEntry.toURL()
            } as IHcpUpdateModel);
          };
          fw.write(data);
        });
      }
    });
  }
  private downloadZipFile(
    url: string,
    onprogress: (hcp: IHcpUpdateModel) => void
  ) {
    return this.downLoadFile(
      url,
      `${this.dataDirectory}${this.updateDirectoryName}`,
      this.updateZipFileName,
      onprogress
    );
  }
  /**
   * 检查是否有新apk要更新
   * @param onprogress
   */
  async checkAppUpdate(
    onprogress: (hcp: IHcpUpdateModel) => void
  ): Promise<{ isCanUpdate: boolean; ignore: boolean }> {
    await this.plt.ready();
    const up = await this.getServerVersion(onprogress);
    this.logMessage(`checkAppUpdate`, up);
    this.localVersion = await this.getLocalVersionNumber();
    if (!up || !up.Version || !up.DownloadUrl) {
      this.logMessage(
        `checkAppUpdate 服务器没有最新文件或者DownloadUrl错误`,
        up
      );
      return {
        isCanUpdate: false,
        ignore: true
      };
    }
    this.serverVersion = up.Version;
    if (
      !this.checkIfUpdateAppByVersion(this.serverVersion, this.localVersion)
    ) {
      this.logMessage(`无需升级更新`);
      return {
        isCanUpdate: false,
        ignore: true
      };
    }
    return {
      isCanUpdate: true,
      ignore: up.Ignore
    };
  }
  /**
   * 更新 apk，仅 Android 平台能够在应用内更新，ios需要到App Store 下载更新
   * @param onprogress
   */
  async updateApk(onprogress: (hcp: IHcpUpdateModel) => void) {
    const result = {
      msg: "",
      status: false,
      newApkPath: ""
    };
    try {
      await this.plt.ready();
      const up = await this.getServerVersion(onprogress);
      this.logMessage(`updateApk`, up);
      this.localVersion = await this.getLocalVersionNumber();
      if (!up || !up.Version || up.Version.length === 0 || !up.DownloadUrl) {
        result.msg = "初始化提前完成";
        result.status = false;
      }
      this.serverVersion = up.Version;
      if (
        !this.checkIfUpdateAppByVersion(this.serverVersion, this.localVersion)
      ) {
        result.msg = "无需更新";
        result.status = false;
      }
      const apkUrl = `${up.ApkDownloadUrl}`;
      this.logMessage(`apkurl =${apkUrl}`);
      if (!apkUrl.includes(".apk")) {
        result.msg = `apk 下载路径${apkUrl}错误`;
        result.status = false;
      }
      const newApkPath = await this.downloadApk(apkUrl, onprogress, up.ApkMd5);
      result.newApkPath = newApkPath;
      result.status = true;
      result.msg = "更新完成";
    } catch (err) {
      this.logError(`updateApk 出错`, err);
      AppHelper.toast(err, 2000, "bottom");
      result.status = true;
      result.msg = "更新完成";
    }
    onprogress({
      hcpUpdateComplete: true,
      taskDesc: result.msg,
      url: result.newApkPath
    } as IHcpUpdateModel);
    return result.newApkPath;
  }
  private getFileMeta(filePath: string): Promise<any> {
    return new Promise(async (resolve, rej) => {
      const exists = await this.checkPathOrFileExists(filePath);
      if (!exists) {
        return resolve({});
      }
      const f = await this.getFileEntry(filePath);
      f.getMetadata(
        res => {
          resolve(res);
        },
        err => {
          rej(err);
        }
      );
    }).catch(e => {
      this.logError(`getMetadata err`, e);
      return {};
    });
  }
  private async downloadApk(
    apkUrl: string,
    onprogress: (hcp: IHcpUpdateModel) => void,
    Md5: string
  ) {
    this.logMessage(`要下载的应用地址: ` + apkUrl);
    const apkPath = `${this.dataDirectory}${
      this.updateDirectoryName
    }/${this.serverVersion.replace(/\./g, "_")}.apk`;
    onprogress({
      total: 100,
      loaded: 90,
      taskDesc: LanguageHelper.getApkDownloadingTip()
    } as IHcpUpdateModel);
    let apkExists;
    const fileMetaData = {} as any;
    if (await this.checkPathOrFileExists(apkPath)) {
      apkExists = await this.checkApkMd5(apkPath, Md5);
    }
    this.logMessage(
      `apk metadata = modificationTime=${fileMetaData.modificationTime},size=${fileMetaData.size}`
    );
    this.logMessage(`apk exists = ${apkPath} ${apkExists ? "存在" : "不存在"}`);
    if (apkExists) {
      onprogress({
        total: 100,
        loaded: 100,
        taskDesc: LanguageHelper.getApkDownloadedTip()
      } as IHcpUpdateModel);
      return apkPath;
    }
    const apks = await this.listDirFiles(
      this.dataDirectory,
      this.updateDirectoryName
    );
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < apks.length; i++) {
      const apk = apks[i];
      const apkP = await this.getParent(apk);
      await this.removeFile(apkP.nativeURL, apk.name);
    }
    const downloadApkUrl = await this.downLoadFile(
      apkUrl,
      `${this.dataDirectory}${this.updateDirectoryName}`,
      `${this.serverVersion.replace(/\./g, "_")}.apk`,
      onprogress
    ).then(file => {
      return file.nativePath;
    });
    if (!downloadApkUrl) {
      return null;
    }
    apkExists = await this.checkApkMd5(downloadApkUrl, Md5);
    this.logMessage("检查下载的apk md5 , ok ? " + apkExists);
    if (apkExists) {
      return downloadApkUrl;
    }
    return null;
  }
  private async checkApkMd5(apkPath: string, serverMd5: string) {
    if (AppHelper.isApp()) {
      return (await this.hcpPlugin.getHash(apkPath)) == serverMd5;
    }
    return true;
  }
  private async checkPathOrFileExists(filePath: string) {
    if (!AppHelper.isApp()) {
      return false;
    }
    return await this.hcpPlugin
      .checkPathOrFileExists(filePath)
      .then(_ => true)
      .catch(_ => false);
  }
  openApk(apkFilePath: string) {
    this.logMessage(`open apk path = ${apkFilePath}`);
    return this.hcpPlugin
      .openAPK(apkFilePath)
      .then(ok => {
        this.logMessage(`openapk ok `);
      })
      .catch(e => {
        this.logError("openapk error", e);
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
      try {
        console.log(`logMessage,${JSON.stringify(e, null, 2)}`);
      } catch (e) {
        console.error("logMessage", e);
      }
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
      try {
        console.log(`logError,${JSON.stringify(e, null, 2)}`);
      } catch (e) {
        console.error("logError", e);
      }
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
      this.logMessage(
        `删除文件${path}/${file}失败，${JSON.stringify(e, null, 2)}`
      );
      return {
        success: false,
        fileRemoved: []
      };
    });
  }
  private listDirFiles(path: string, dir: string) {
    if (!AppHelper.isApp()) {
      return Promise.resolve([] as Entry[]);
    }
    return this.file
      .listDir(path, dir)
      .then(en => {
        this.logMessage(`列出文件夹${path}/${dir}下面的所有文件：`);
        en.forEach(item => {
          this.logMessage(`【${item.name}】`);
        });
        return en;
      })
      .catch(e => {
        this.logMessage(
          `列出文件夹${path}/${dir}下面的所有文件抛出异常` +
            JSON.stringify(e, null, 2)
        );
        return [] as Entry[];
      });
  }

  private clearVersionDirectory(version: string) {
    const path = `${this.dataDirectory}${this.updateDirectoryName}`;
    const versionDir = `${this.www}_${version}`.replace(/\./g, "_");
    this.logMessage(`开始删除版本${version},${path}/${versionDir}`);
    return this.removeRecursively(path, versionDir).then(r => {
      this.logMessage(`完成删除版本${version},${path}/${versionDir}`);
      return r;
    });
  }
  private createFile(
    path: string,
    fileName: string,
    replace: boolean
  ): Promise<FileEntry> {
    if (!AppHelper.isApp()) {
      return Promise.resolve(null);
    }
    this.logMessage(`开始创建文件${path}/${fileName}`);
    return this.file
      .createFile(path, fileName, replace)
      .then(fe => {
        this.logMessage(`创建文件${fe.nativeURL}成功`);
        return fe;
      })
      .catch(e => {
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
      return Promise.resolve(
        {} as {
          success: false;
          fileRemoved: null;
        }
      );
    }
    this.logMessage(`开始递归删除文件夹 ${path}/${directoryName}`);
    return this.file.removeRecursively(path, directoryName).catch(e => {
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
  private checkIfHcpUpdateByVersion(
    serverVersion: string,
    localVersion: string
  ) {
    this.logMessage(
      `比较热更版本 server:${serverVersion} <===> localversion ${localVersion}`
    );
    if (!serverVersion || !localVersion) {
      return false;
    }
    const sVs = serverVersion.split(".");
    const lVs = localVersion.split(".");
    if (sVs.length !== lVs.length) {
      return false;
    }
    const smain = +sVs[0];
    const sMinor = +sVs[1];
    const sPatch = +sVs[sVs.length - 1];
    const lmain = +lVs[0];
    const lMinor = +lVs[1];
    const lPatch = +lVs[sVs.length - 1];
    return (
      smain == lmain &&
      sMinor == lMinor &&
      sPatch > lPatch &&
      serverVersion !== this.getLocalHcpVersion()
    );
  }
  /**
   *
   * @param serverVersion 服务器版本
   * @param localVersion  当前运行的版本
   * @returns 返回 true 表示要更新，false不需要更新
   */
  private checkIfUpdateAppByVersion(
    serverVersion: string,
    localVersion: string
  ) {
    this.logMessage(
      `比较应用主版本，判断是否需要升级,serverVersion=${serverVersion}<=>localVersion=${localVersion}`
    );
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
    // this.logMessage(`比较应用主版本，判断是否需要升级,serverVersion=${serverVersion}<=>localVersion=${localVersion} `);

    return smain !== lmain || sMinor !== lMinor;
  }
  private checkPathFileExists(
    path: string,
    fileName: string
  ): Promise<boolean> {
    if (!AppHelper.isApp()) {
      return Promise.resolve(true);
    }
    this.logMessage(`检查文件 ${path}/${fileName} 是否存在`);
    return this.file
      .checkFile(path, fileName)
      .then(en => {
        this.logMessage(`文件 ${path}/${fileName}【存在】`);
        return en;
      })
      .catch(e => {
        this.logMessage(
          `文件 ${path}/${fileName}【~~不存在~~】${JSON.stringify(e, null, 2)}`
        );
        // this.logMessage(`检查文件${path}/${fileName} 是否存在出现异常 ${JSON.stringify(e, null, 2)}`);
        return false;
      });
  }
  private checkDirExists(path: string, dirName: string) {
    this.logMessage(
      `检查路径${path}${
        (path || "").endsWith("/") ? "" : "/"
      }${dirName}是否存在`
    );
    return this.file
      .checkDir(path, dirName)
      .then(_ => {
        this.logMessage(
          `路径${path}${
            (path || "").endsWith("/") ? "" : "/"
          }${dirName}是否存在?${_}】`
        );
        return true;
      })
      .catch(e => {
        this.logMessage(
          `路径${path}/${dirName}【不存在】${JSON.stringify(e, null, 2)}`
        );
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
      const versionDir = `${this.www}_${this.serverVersion}`.replace(
        /\./g,
        "_"
      );
      let files = await this.getDirectoryFilesRecursively(
        `${path}/${versionDir}`,
        this.www,
        []
      );
      this.logMessage(
        `解压后的总文件数量：${files.length}个，md5JsonFile记录${md5JsonFile.length}个文件`
      );
      files = files.filter(
        item =>
          !item.toURL().includes(".zip") &&
          !item.toURL().includes(this.md5JsonFileName)
      ); // 调试阶段多了一个zip文件
      this.logMessage(
        `-----------${md5JsonFile.length}】个原始文件与${files.length}个解压文件进行校验-----------`
      );
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
        const filePath = f
          .toURL()
          .substring(f.toURL().indexOf("www/") + "www/".length);
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
        const path = dirEntry.toInternalURL().endsWith("/")
          ? dirEntry
              .toInternalURL()
              .substring(0, dirEntry.toInternalURL().lastIndexOf("/"))
          : dirEntry.toInternalURL();
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
      this.logMessage(
        `总共有${
          checkMd5Failures.filter(item => !item.downloadMd5 || !item.md5).length
        }个文件md5不存在`
      );
      this.logMessage(
        `总共校验${files.length}个文件，其中${
          checkMd5Failures.length
        }个校验失败，校验详细结果:${JSON.stringify(checkMd5Failures, null, 2)}`
      );
      return checkMd5Failures.length === 0;
    } catch (e) {
      this.logMessage(`文件校验异常${JSON.stringify(e, null, 2)}`);
      return false;
    }
  }

  private readFileAsString(path: string, file: string) {
    return this.file.readAsText(path, file).catch(e => {
      this.logError(`readFileAsString error `, e);
      return "";
    });
  }
  private getParent(f: Entry) {
    return new Promise<DirectoryEntry>((s, rej) => {
      f.getParent(
        dirEntry => {
          s(dirEntry);
        },
        err => {
          this.logMessage(
            `f entry getParent 失败${JSON.stringify(err, null, 2)}`
          );
          s(null);
        }
      );
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
  private async download(
    fileURL: string,
    url: string,
    onprogress: (evt: ProgressEvent) => void,
    ticket = ""
  ) {
    return new Promise<string>((rsl, rej) => {
      console.log(`new window["FileTransfer"]`, typeof window["FileTransfer"]);
      const fileTransfer: any = new window["FileTransfer"]();
      const uri = encodeURI(`${url}`);
      if (!fileTransfer) {
        return rej("fileTransfer 不存在");
      }
      fileTransfer.onprogress = onprogress;
      fileTransfer.download(
        uri,
        fileURL,
        entry => {
          console.log("download complete: " + entry.toURL());
          console.log("download complete: " + JSON.stringify(entry, null, 2));
          rsl(entry.toURL());
        },
        error => {
          console.log("download error source " + error.source);
          console.log("download error target " + error.target);
          console.log("download error code" + error.code);
          rej("下载失败");
        },
        false,
        {
          headers: {
            Ticket: ``
          }
        }
      );
    });
  }
  private async getDirectoryFilesRecursively(
    path: string,
    dir: string,
    entries: Entry[]
  ) {
    const tempEntry = await this.getDirectoryFiles(path, dir);
    for (let i = 0; i < tempEntry.length; i++) {
      const item = tempEntry[i];
      if (item.isFile) {
        entries.push(item);
      } else {
        const p = await this.getParent(item);
        // this.logMessage(`读取目录${p.toURL()},【${item.name}】下的文件`);
        const itemPath = p.toURL().endsWith("/")
          ? p.toURL().substring(0, p.toURL().lastIndexOf("/"))
          : p.toURL();
        // this.logMessage(`【${item.name}】有${(await this.file.listDir(itemPath, item.name)).length}个文件【${item.isDirectory ? "夹" : ""}】`);
        await this.getDirectoryFilesRecursively(
          `${itemPath}`,
          item.name,
          entries
        );
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
      this.logMessage(
        `读取目录【${dir}】 下的文件异常,: ${JSON.stringify(e, null, 2)}`
      );
      return [];
    }
  }
}
