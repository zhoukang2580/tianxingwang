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
  show: () => Promise<IQrScannerStatus>;
  pausePreview: () => Promise<IQrScannerStatus>;
  resumePreview: () => Promise<IQrScannerStatus>;
  getStatus: () => Promise<IQrScannerStatus>;
  openSettings: () => Promise<IQrScannerStatus>;
}
@Injectable({
  providedIn: "root",
})
export class QrScanService implements IQRScanner {
  private qrScanner: { [key in keyof IQRScanner]: any };
  private scanResultSource: Subject<string>;
  constructor(private plt: Platform) {
    this.plt.ready().then(() => {
      this.qrScanner = window["qrScanner"];
    });
    this.scanResultSource = new BehaviorSubject(null);
  }
  getScanResultSource() {
    return this.scanResultSource.asObservable();
  }
  setScanResultSource(txt: string) {
    this.scanResultSource.next(txt);
  }
  async prepare() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.prepare(resolve, reject);
    });
  }
  async cancelScan() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.cancelScan(resolve, reject);
    });
  }

  async destroy() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.destroy(resolve, reject);
    });
  }
  async enableLight() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.enableLight(resolve, reject);
    });
  }
  async disableLight() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<void>((resolve, reject) => {
      this.qrScanner.disableLight(resolve, reject);
    });
  }
  async scan() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<string>((resolve, reject) => {
      this.qrScanner.scan(resolve, reject);
    });
  }
  async resumePreview() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.resumePreview(resolve, reject);
    });
  }
  async pausePreview() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.pausePreview(resolve, reject);
    });
  }
  async getStatus() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.getStatus(resolve, reject);
    });
  }
  async hide() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.hide(resolve, reject);
    });
  }
  async show() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
    return new Promise<IQrScannerStatus>((resolve, reject) => {
      this.qrScanner.show(resolve, reject);
    });
  }
  async openSettings() {
    await this.plt.ready();
    this.qrScanner = window["qrScanner"];
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
