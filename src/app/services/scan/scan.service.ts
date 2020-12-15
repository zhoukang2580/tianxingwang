import { Platform } from "@ionic/angular";
import { EventEmitter, Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable, Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
export interface IQRScanner {
  prepare: () => Promise<IQrScannerStatus>;
  cancelScan: () => Promise<void>;
  destroy: () => Promise<void>;
  enableLight: () => Promise<void>;
  disableLight: () => Promise<void>;
  scan: () => Promise<string>;
  hide: () => Promise<IQrScannerStatus>;
  show: () => Promise<IQrScannerStatus>;
  pausePreview: () => Promise<IQrScannerStatus>;
  resumePreview: () => Promise<IQrScannerStatus>;
  getStatus: () => Promise<IQrScannerStatus>;
  openSettings: () => Promise<IQrScannerStatus>;
}
@Injectable({
  providedIn: "root",
})
export class ScanService implements IQRScanner {
  private qrScanner: { [key in keyof IQRScanner]: any };
  private scanResultSource: EventEmitter<any>;
  constructor(private plt: Platform) {
    this.plt.ready().then(() => {
      this.qrScanner = window["qrScanner"];
      if (!AppHelper.isApp()) {
        this.qrScanner = {} as any;
        this.qrScanner.prepare = async (rsv, rej) => {
          rsv({ authorized: "1" } as IQrScannerStatus);
        };
        this.qrScanner.hide = async () => {};
        this.qrScanner.show = async () => {};
        this.qrScanner.pausePreview = async () => {};
        this.qrScanner.resumePreview = async () => {};
        this.qrScanner.openSettings = async () => {};
        this.qrScanner.cancelScan = async () => {};
        this.qrScanner.destroy = async () => {};
        this.qrScanner.enableLight = async () => {};
        this.qrScanner.getStatus = async () => {
          return { authorized: "1" } as IQrScannerStatus;
        };
        this.qrScanner.scan = async (rsv, rej) => {
          rsv(
            "测试文本的手机壳了附近受得了开发技术的雷锋精神的了分手的距离风扇电机浪费可视角度发2020年12月10日17:43:01"
          );
        };
      }
    });
    this.scanResultSource = new EventEmitter();
  }
  getScanResultSource() {
    return this.scanResultSource;
  }
  setScanResultSource(txt: string) {
    this.scanResultSource.emit(txt);
  }
  async prepare() {
    await this.plt.ready();
    this.qrScanner = this.getQrScanner();
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.prepare(resolve, reject);
    });
  }
  private getQrScanner() {
    return this.qrScanner || window["qrScanner"];
  }
  cancelScan() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.cancelScan(resolve, reject);
    });
  }

  destroy() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.destroy(resolve, reject);
    });
  }
  enableLight() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.enableLight(resolve, reject);
    });
  }
  disableLight() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.disableLight(resolve, reject);
    });
  }
  async scan() {
    await this.plt.ready();
    this.qrScanner = this.getQrScanner();
    return new Promise<string>((resolve, reject) => {
      this.qrScanner.scan(resolve, reject);
    });
  }
  async resumePreview() {
    await this.plt.ready();
    this.qrScanner = this.getQrScanner();
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.resumePreview(resolve, reject);
    });
  }
  async pausePreview() {
    await this.plt.ready();
    this.qrScanner = this.getQrScanner();
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.pausePreview(resolve, reject);
    });
  }
  getStatus() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.getStatus(resolve, reject);
    });
  }
  hide() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.hide(resolve, reject);
    });
  }
  show() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.show(resolve, reject);
    });
  }
  openSettings() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.openSettings(resolve, reject);
    });
  }
}

export type ZeroOne = "0" | "1";
export interface IQrScannerStatus {
  authorized: ZeroOne;
  denied: ZeroOne;
  restricted: ZeroOne;
  prepared: ZeroOne;
  scanning: ZeroOne;
  previewing: ZeroOne;
  showing: ZeroOne;
  lightEnabled: ZeroOne;
  canOpenSettings: ZeroOne;
  canEnableLight: ZeroOne;
  canChangeCamera: ZeroOne;
  currentCamera: ZeroOne;
}
