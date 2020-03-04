import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrScanService implements IQRScanner {
  private qrScanner: { [key in keyof IQRScanner]: any };
  constructor(private plt: Platform) {
    this.plt.ready().then(() => {
      this.qrScanner = window['qrScanner'];
    })
  }
  prepare() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.prepare(resolve, reject);
    });
  }
  cancelScan() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.cancelScan(resolve, reject);
    })
  }

  destroy() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.destroy(resolve, reject);
    })
  }
  enableLight() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.enableLight(resolve, reject);
    })
  }
  disableLight() {
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.enableLight(resolve, reject);
    })
  }
  scan() {
    return new Promise<string>((resolve, reject) => {
      this.qrScanner.scan(resolve, reject);
    })
  }
  hide() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.scan(resolve, reject);
    })
  }
  getStatus() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.getStatus(resolve, reject);
    })
  }
  show() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.show(resolve, reject);
    })
  }
  pausePreview() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.pausePreview(resolve, reject);
    })
  }
  openSettings() {
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.openSettings(resolve, reject);
    })
  }
}
export interface IQRScanner {
  prepare: () => Promise<IQrScannerStatus>;
  cancelScan: () => Promise<void>;
  destroy: () => Promise<void>;
  enableLight: () => Promise<void>;
  disableLight: () => Promise<void>;
  scan: () => Promise<string>;
  hide: () => Promise<IQrScannerStatus>;
  pausePreview: () => Promise<IQrScannerStatus>;
  show: () => Promise<IQrScannerStatus>;
  getStatus: () => Promise<IQrScannerStatus>;
  openSettings: () => Promise<IQrScannerStatus>;
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