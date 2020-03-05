import { Platform } from "@ionic/angular";
import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable, Subscription } from "rxjs";
export interface IQRScanner {
  prepare: () => Promise<IQrScannerStatus>;
  cancelScan: () => Promise<void>;
  destroy: () => Promise<void>;
  enableLight: () => Promise<void>;
  disableLight: () => Promise<void>;
  scan: () => Promise<string>;
  hide: () => Promise<IQrScannerStatus>;
  pausePreview: () => Promise<IQrScannerStatus>;
  resumePreview: () => Promise<IQrScannerStatus>;
  show: () => Promise<IQrScannerStatus>;
  getStatus: () => Promise<IQrScannerStatus>;
  openSettings: () => Promise<IQrScannerStatus>;
}
@Injectable({
  providedIn: "root"
})
export class QrScanService implements IQRScanner {
  private qrScanner: { [key in keyof IQRScanner]: any };
  private subscription = Subscription.EMPTY;
  private scanResultSource: Subject<string>;
  isScanSetup = false;
  constructor(private plt: Platform) {
    this.plt.ready().then(() => {
      this.qrScanner = window["qrScanner"];
    });
    this.scanResultSource = new BehaviorSubject("");
  }
  prepare() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.prepare(resolve, reject);
    });
  }
  cancelScan() {
    this.isScanSetup = false;
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.cancelScan(resolve, reject);
    });
  }

  destroy() {
    this.isScanSetup = false;
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
      this.qrScanner.enableLight(resolve, reject);
    });
  }
  async scan() {
    if (!this.isScanSetup) {
      this.isScanSetup = true;
      this.qrScanner.scan(
        text => {
          this.scanResultSource.next(text);
        },
        err => {
          this.scanResultSource.error(err);
        }
      );
    } else {
      let status = await this.getStatus();
      if (status.authorized == "0") {
        const s = await this.prepare();
        if (s.denied == "1") {
          this.subscription.unsubscribe();
          return Promise.reject("您拒绝使用相机功能");
        }
        if (s.authorized == "0") {
          await this.openSettings();
        }
      }
      status = await this.getStatus();
      if (status.authorized == "0") {
        this.subscription.unsubscribe();
        return Promise.reject("您尚未允许使用相机功能");
      }
      if (status.previewing == "0") {
        await this.resumePreview();
      }
    }
    this.subscription.unsubscribe();
    return new Promise<string>((resolve, reject) => {
      this.subscription = this.scanResultSource.subscribe(
        text => {
          resolve(text);
        },
        err => {
          reject(err);
        }
      );
    });
  }
  resumePreview() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.resumePreview(resolve, reject);
    });
  }
  pausePreview() {
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
