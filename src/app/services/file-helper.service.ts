import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from "@ionic-native/file/ngx";
import { Platform } from '@ionic/angular';
import { Zip } from '@ionic-native/zip/ngx';
import { Observable, throwError, of, from } from 'rxjs';
import { switchMap, map, tap, finalize } from 'rxjs/operators';
import { ApiService } from './api/api.service';
import { BaseRequest } from './api/BaseRequest';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppHelper } from '../appHelper';
import { LanguageHelper } from '../languageHelper';
type UpdateList = {
  Url: string;
  Version: {
    Folder: string;
    Value: string;// 版本
    Ignore: boolean;// 是否可以忽略
    Remove: boolean;// 是否清除基础数据,
    Hotfix: {
      Folder: string;
      Md5: string;
    }[]
  }[];
};
type HcpUpdateModel = {
  url: string;
  folder: string;
  serverVersion: string;
  canUpdate: boolean;
  total: number;
  loaded: number;
  taskDesc?: string;
  nativeURL?: string;
  unZipComplete?: boolean;
};
@Injectable({
  providedIn: 'root'
})
export class FileHelperService {
  private readonly updateZipFileName: string = "DongmeiIonic.zip";
  private readonly updateDirectoryName: string = "updateWwwDirectory";//
  private readonly www = "www";
  private localVersion: string = AppHelper.isApp() ? null : "1.0.0";
  private serverVersion:string;
  fileInfo: any = {};
  constructor(private file: File,
    private httpClient: HttpClient,
    private apiService: ApiService,
    private appVersion: AppVersion,
    private plt: Platform,
    private zip: Zip) {
    this.plt.ready().then(async () => {
      this.localVersion = await this.appVersion.getVersionNumber();
      this.fileInfo.dataDrectory = this.file.dataDirectory;
      this.fileInfo.cacheDirector = this.file.cacheDirectory;
      this.fileInfo.tempDirectory = this.file.tempDirectory;
      this.fileInfo.documentsDirectory = this.file.documentsDirectory;
      this.fileInfo.syncedDataDirectory = this.file.syncedDataDirectory;
      this.fileInfo.applicationDirectory = this.file.applicationDirectory;
      this.fileInfo.applicationStorageDirectory = this.file.applicationStorageDirectory;
      this.fileInfo.externalApplicationStorageDirectory = this.file.externalApplicationStorageDirectory;
      this.fileInfo.externalRootDirectory = this.file.externalRootDirectory;
      console.log(JSON.stringify(this.fileInfo));
      this.createUpdateWwwDirectory();
    });
  }
  private async createUpdateWwwDirectory() {
    try {
      this.plt.ready().then(() => {
        return this.checkDirExists(this.file.dataDirectory, this.updateDirectoryName);
      }).then(exist => {
        if (!exist) {
          return this.createDir(this.file.dataDirectory, this.updateDirectoryName);
        }
      });
    } catch (e) {
      console.error("创建 wwwPath 失败, " + JSON.stringify(e, null, 2));
      return Promise.resolve(null);
    }
  }
  private createDir(path: string, dirName: string) {
    console.log(`创建文件夹 ${path}${dirName}`);
    return this.file.createDir(path, dirName, false)
      .then(diren => {
        console.log(`创建文件夹成功${path}${dirName}`);
        return diren;
      })
      .catch(e => {
        console.log(`创建文件夹失败` + JSON.stringify(e, null, 2));
      });
  }
  private unZip(filePath: string, destPath: string): Observable<HcpUpdateModel> {
    return new Observable(obs => {
      this.plt.ready().then(() => {
        console.log(`开始解压文件 ${filePath} 到 ${destPath}`);
        this.zip.unzip(filePath, destPath, (progress: { loaded: number; total: number }) => {
          obs.next({ loaded: progress.loaded, total: progress.total, canUpdate: true, taskDesc: LanguageHelper.getHcpUnZipTip() } as HcpUpdateModel);
          console.log(`解压进度 ${Math.floor(100 * progress.loaded / progress.total)}%`);
        }).then((status) => {
          if (status === 0) {
            console.log(`解压进度成功!`);
            // 删除下载的压缩包
            this.removeFile(`${this.file.dataDirectory}${this.updateDirectoryName}`, this.updateZipFileName);
            obs.next({ canUpdate: true, nativeURL: destPath, unZipComplete: true} as HcpUpdateModel);
            obs.complete();
          } else {
            console.log(`解压失败!`);
            obs.error("解压失败");
          }
        }).catch(e => {
          obs.error(e);
          console.log("解压异常，" + JSON.stringify(e, null, 2));
        })
      });
    });
  }
  checkHcpUpdate() {
    const req = new BaseRequest();
    req.Method = "ServiceVersionUrl-Home-Index";
    req.Data = { "Product": "DongmeiIonicAndroid" };
    return from(this.plt.ready().then(async () => {
      await this.createUpdateWwwDirectory();
      if (!this.localVersion) {
        this.localVersion = await this.appVersion.getVersionNumber();
      }
      console.log(`获取到的localVersion=${this.localVersion}`);
    })).pipe(
      // 获取服务器版本
      switchMap(() => {
        return this.apiService.getResponse<UpdateList>(req)
          .pipe(
            switchMap(res => {
              if (res.Status) {
                return of(res.Data);
              } else {
                return throwError(res.Message);
              }
            })
          );
      }),
      // 判断是否需要热更
      switchMap(res => {
        if (!res.Version ||
          res.Version.length === 0 ||
          !res.Version[0].Hotfix ||
          res.Version[0].Hotfix.length === 0 ||
          !res.Version[0].Hotfix[0]
        ) {
          return of({
            canUpdate: false
          } as HcpUpdateModel);
        }
        this.serverVersion=res.Version[0].Value;
        // 根据版本判断，是否需要热更新
        const versionUpdate = this.checkIfHcpUpdateByVersion(res.Version[0].Value, this.localVersion);
        if (!versionUpdate) {
          return of({
            canUpdate: false
          } as HcpUpdateModel);
        }
        // 判断本地是否存在
        // path/www_1_1_0
        return from(
          this.checkLocalExists(res.Version[0].Value)
        )
          .pipe(map(exists => (
            {
              ...res,
              canUpdate: !exists,// 本地无有效的版本，则需要热更
              url: res.Url,
              folder: res.Version[0].Hotfix[0].Folder,
              serverVersion: res.Version[0].Value,
              loaded: 0,
              total: 1
            })));
      }),
      // 开始执行热更（如果需要的话）
      switchMap(r => {
        if (!r.canUpdate) {
          return of(r);
        }
        return this.execHcpUpdate(r);
      }),
      // 开始解压文件
      switchMap(response => {
        if (!response.canUpdate || !response.nativeURL) {
          return of(response);
        }
        const path = `${this.file.dataDirectory}${this.updateDirectoryName}`;
        const versionDir = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
        return this.unZip(response.nativeURL, `${path}/${versionDir}`);
      }),
      // 解压完成后，生成一个文件，标记改版本可用
      switchMap(r => {
        if (r.unZipComplete) {
          const path = `${this.file.dataDirectory}${this.updateDirectoryName}`;
          const versionDir = `${this.www}_${this.serverVersion}`.replace(/\./g, "_");
          console.log(`解压完成，开始创建标记文件${this.serverVersion},${versionDir}`);
          return from(
            this.createFile(`${path}/${versionDir}`, `${versionDir}.log`, true)
              .then(r => {
                if (!r) {
                  console.log("创建标记文件失败");
                  return { canUpdate: false, nativeURL: null } as HcpUpdateModel;
                }
                console.log("创建标记文件成功");
                this.listDirFiles(path, versionDir);
                this.listDirFiles(path+"/"+versionDir, this.www);
                const fileUrl = r.nativeURL;
                console.log("文件NativeUrl" + r.nativeURL);
                return { canUpdate: true, unZipComplete: true, nativeURL: fileUrl, total: 1, loaded: 1 } as HcpUpdateModel;
              })
          );
        }
        return of(r);
      }),
      finalize(() => {
        this.listDirFiles(this.file.dataDirectory, this.updateDirectoryName);
        // 删除下载的压缩包
        this.removeFile(`${this.file.dataDirectory}${this.updateDirectoryName}`, this.updateZipFileName);
      })
    );
  }
  /**
   *  检查 服务器版本是否已经下载到本地，或者，本地是否存在一个有效的服务器版本
   *  // path/www_1_1_0
   * @param serverVersion 
   */
  private checkLocalExists(serverVersion: string) {
    console.log(`checkLocalExists,serverVersion=${serverVersion}`)
    return this.checkDirExists(`${this.file.dataDirectory}${this.updateDirectoryName}`,
      `${this.www}_${serverVersion}`.replace(/\./g, "_"))
      .then(exists => {
        if (exists) {
          // 存在，判断文件夹内是否存在 www_1_1_0.log 文件
          const path = `${this.file.dataDirectory}${this.updateDirectoryName}`;
          const versionDir = `${this.www}_${serverVersion}`.replace(/\./g, "_");
          return this.checkFile(`${path}/${versionDir}`, `${versionDir}.log`)
            .then(fileExists => {
              if (!fileExists) {
                // 本地的版本是无效的
                // 删除文件夹
                this.clearVersionDirectory(serverVersion);
              }
              return fileExists;
            });
        }
        return false;
      })
  }
  private removeFile(path: string, file: string) {
    console.log(`删除文件${path}/${file}`);
    return this.file.removeFile(path, file).catch(e => {
      console.log(`删除文件${path}/${file}失败，${JSON.stringify(e, null, 2)}`);
      return {
        success: false,
        fileRemoved: []
      };
    })
  }
  private listDirFiles(path: string, dir: string) {
    return this.file.listDir(path, dir).then(en => {
      console.log(`列出文件夹${path}/${dir}下面的所有文件：`);
      en.forEach(item => {
        console.log(`【${item.name}】\t\r\n`);
      });
      return en;
    }).catch(e => {
      console.log(`列出文件夹${path}${dir}下面的所有文件抛出异常` + JSON.stringify(e, null, 2));
      return [];
    });
  }
  private execHcpUpdate(data: HcpUpdateModel) {
    const url =
      // AppHelper.isApp() ? `${data.url}/${data.folder}` :
      `assets/${this.updateZipFileName}`;
    console.log(`获取【${url}】服务器的文件`);
    return this.httpClient.get(url, { observe: "events", responseType: "arraybuffer", reportProgress: true }).pipe(
      switchMap((evt: any) => {
        console.log(evt);
        return new Observable<HcpUpdateModel>(obs => {
          if (evt.total) {
            obs.next({
              ...data,
              canUpdate: true,
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: LanguageHelper.getHcpDownloadingTip()
            } as HcpUpdateModel);
          } else if (evt instanceof HttpResponse) {
            console.log(`文件下载完成，开始创建zip文件`);
            this.createFile(`${this.file.dataDirectory}${this.updateDirectoryName}`, this.updateZipFileName, true).then(fileEntry => {
              if (!fileEntry) {
                console.log(`创建zip文件失败`);
                obs.error("文件下载失败");
                // this.removeRecursively();
                this.clearVersionDirectory(this.serverVersion);
                this.removeFile(`${this.file.dataDirectory}${this.updateDirectoryName}`, this.updateZipFileName);
              } else {
                fileEntry.createWriter(fw => {
                  fw.onprogress = (ev => {
                    console.log(`正在写入文件${Math.floor(ev.loaded / ev.total * 100)}%`);
                    obs.next({
                      canUpdate: true,
                      loaded: ev.loaded,
                      // lengthComputable: ev.lengthComputable,
                      taskDesc: LanguageHelper.getWritingFileTip(),
                      total: ev.total
                    } as HcpUpdateModel);
                  });
                  fw.onerror = e => {
                    console.log(`文件写入失败${JSON.stringify(e, null, 2)}`);
                    obs.error(e);
                  };
                  fw.onwriteend = (ev) => {
                    // console.log(`文件写入完成:${ev.total},fullPath=${fileEntry.fullPath}`);
                    // console.log(`文件写入完成:${ev.total},nativeURL=${fileEntry.nativeURL}`);
                    // console.log(`文件写入完成:${ev.total},toURL=${fileEntry.toURL()}`);
                    // console.log(`文件写入完成:${ev.total},toInternalURL=${fileEntry.toInternalURL()}`);
                    obs.next({ canUpdate: true, total: ev.total, loaded: ev.loaded, nativeURL: fileEntry.nativeURL, serverVersion: this.serverVersion } as HcpUpdateModel);
                    obs.complete();
                  }
                  fw.write(evt.body);
                });
              }
            });
          } else {
            obs.next(evt as any);
          }
        });
      })
    );
  }
  private clearVersionDirectory(version: string) {
    const path = `${this.file.dataDirectory}${this.updateDirectoryName}`;
    const versionDir = `${this.www}_${version}`.replace(/\./g, "_");
    console.log(`开始清楚版本${version},${path}/${versionDir}`);
    return this.removeRecursively(path, versionDir).then(r => {
      console.log(`完成清楚版本${version},${path}/${versionDir}`);
      return r;
    });
  }
  private createFile(path: string, fileName: string, replace: boolean) {
    console.log(`创建文件${path}/${fileName}`);
    return this.file.createFile(path, fileName, replace).catch(e => {
      console.log(`创建文件失败${JSON.stringify(e, null, 2)}`);
      return null;
    });
  }
  /**
   *  递归删除文件夹下面的所有文件，以及文件夹本身
   * @param path 
   * @param directoryName 
   */
  private removeRecursively(path: string, directoryName: string) {
    try {
      return this.file.removeRecursively(path, directoryName);
    } catch (e) {
      console.log(`递归删除文件夹失败` + JSON.stringify(e, null, 2));
      return Promise.resolve({
        success: false,
        fileRemoved: null
      });
    }
  }
  /**
   *  
   * @param serverVersion 服务器版本
   * @param localVersion  当前运行的版本
   * @returns 返回 true 表示要更新，false不需要更新 
   */
  private checkIfHcpUpdateByVersion(serverVersion: string, localVersion: string) {
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
  private checkFile(path: string, fileName: string) {
    console.log(`检查文件${path}/${fileName}是否存在`);
    return this.file.checkFile(path, fileName)
      .catch(e => {
        console.log(`检查文件${path}/${fileName} 是否存在出现异常 ${JSON.stringify(e, null, 2)}`);
        return false;
      })
  }
  private checkDirExists(path: string, dirName: string) {
    console.log(`检查路径${path}目录${dirName}是否存在`);
    return new Promise<boolean>((resolve, reject) => {
      this.file.checkDir(path, dirName)
        .then(_ => {
          console.log(`检查路径${path}目录${dirName}存在`);
          resolve(true);
        }).catch(e => {
          reject(e);
        });
    }).catch(e => {
      console.log(`检查路径异常，` + JSON.stringify(e, null, 2));
      return false;
    });
  }
  downloadFile(url: string, destPath: string) {

  }
}
