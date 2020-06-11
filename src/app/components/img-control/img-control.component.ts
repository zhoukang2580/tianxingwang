import { EventEmitter } from "@angular/core";
import { ImgPickerComponent } from "./../img-picker/img-picker.component";
import { ModalController } from "@ionic/angular";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Platform } from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import { OnDestroy, Input, Output } from "@angular/core";
import { ElementRef } from "@angular/core";
import { Component, OnInit, ViewChild } from "@angular/core";
import Cropper from "cropperjs";
import { AppHelper } from "src/app/appHelper";
@Component({
  selector: "app-img-control",
  templateUrl: "./img-control.component.html",
  styleUrls: ["./img-control.component.scss"],
})
export class ImgControlComponent implements OnInit, OnDestroy {
  @ViewChild("input", { static: true }) inputFile: ElementRef<HTMLInputElement>;
  private subscription = Subscription.EMPTY;
  isViewImage = false;
  result: { name: string; fileValue: string };
  cropper: Cropper;
  isShowImage = false;
  showCropBox = false;
  uploaded = false;
  imgUrl = "";
  @Input() file: any;
  @Output() fileChange: EventEmitter<any>;
  constructor(
    private plt: Platform,
    private webView: WebView,
    private modalCtrl: ModalController
  ) {
    this.fileChange = new EventEmitter();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onHide() {
    this.modalCtrl.getTop().then((m) => {
      m.dismiss();
    });
  }
  ngOnInit() {
    setTimeout(() => {
      this.isShowImage = !!this.isViewImage;
    }, 100);
    this.result = { fileValue: "", name: "" };
    this.subscription = fromEvent(
      this.inputFile.nativeElement,
      "change"
    ).subscribe((evt) => {
      if (this.inputFile.nativeElement.files) {
        const files = (evt.target as HTMLInputElement).files;
        const file = files[0];
        let imgUrl = "";
        if (file) {
          this.result.name = file.name;
          if (AppHelper.isApp()) {
            window.URL = window.URL || window["webkitURL"];
            const objectURL = window.URL.createObjectURL(file);
            imgUrl = this.webView.convertFileSrc(objectURL);
            this.inputFile.nativeElement.value = null;
            this.openCropper(imgUrl);
          } else {
            const fr = new FileReader();
            fr.onload = () => {
              imgUrl = fr.result as string;
              this.openCropper(imgUrl);
              this.inputFile.nativeElement.value = null;
            };
            fr.readAsDataURL(file);
          }
        }
      }
    });
  }
  onSelectFile() {
    this.inputFile.nativeElement.click();
  }
  private async openCropper(src: string) {
    const m = await this.modalCtrl.create({
      component: ImgPickerComponent,
      componentProps: {
        imgUrl: src,
      },
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      this.result = {
        ...this.result,
        fileValue: result.data.fileValue,
      };
      this.file = this.result;
      this.fileChange.emit(this.file);
    }
  }
}
