import { EventEmitter } from "@angular/core";
import { ImgPickerComponent } from "./../img-picker/img-picker.component";
import { ModalController, ActionSheetController } from "@ionic/angular";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Platform } from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import { OnDestroy, Input, Output } from "@angular/core";
import { ElementRef } from "@angular/core";
import { Component, OnInit, ViewChild } from "@angular/core";
import Cropper from "cropperjs";
import { AppHelper } from "src/app/appHelper";
import { PhotoGalleryComponent } from "../photo-gallary/photo-gallery.component";
@Component({
  selector: "app-img-control",
  templateUrl: "./img-control.component.html",
  styleUrls: ["./img-control.component.scss"],
})
export class ImgControlComponent implements OnInit, OnDestroy {
  @ViewChild("input", { static: true }) inputFile: ElementRef<HTMLInputElement>;
  private subscription = Subscription.EMPTY;
  isViewImage = false;
  result: {
    name: string;
    fileValue: string;
    imageUrl: string;
    fileName: string;
  };
  cropper: Cropper;
  isShowImage = false;
  showCropBox = false;
  uploaded = false;
  @Input() maxCropHeight;
  @Input() maxCropWidth;
  @Input() minCropBoxWidthPercent;
  @Input() defaultImage: any;
  @Input() loadingImage: any;
  @Input() file: any;
  @Input() chooseScene = false;
  @Output() fileChange: EventEmitter<any>;
  pos = 0;
  imageUrls: { imageUrl: string; isActive?: boolean }[];
  constructor(
    private plt: Platform,
    private webView: WebView,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
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
    this.listenChange();
    this.isShowImage = !!this.isViewImage;
    if (this.isShowImage) {
      if (this.imageUrls) {
        this.pos = this.imageUrls.findIndex((it) => it.isActive);
      }
    }
    this.result = { fileValue: "", name: "", imageUrl: "", fileName: "" };
  }
  private listenChange() {
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
  async onSelectFile() {
    if (!this.chooseScene) {
      this.inputFile.nativeElement.click();
    } else {
      const a = await this.actionSheetCtrl.create({
        buttons: [
          {
            text: "从图库中选择",
            handler: () => {
              a.dismiss();
              this.openPhotoGallery();
            },
          },
          {
            text: "手机上选择",
            handler: () => {
              a.dismiss();
              this.inputFile.nativeElement.click();
            },
          },
        ],
      });
      a.present();
    }
  }
  private async openPhotoGallery() {
    const m = await this.modalCtrl.create({ component: PhotoGalleryComponent });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      this.result = {
        name: d.data,
        imageUrl: d.data,
        fileValue: "",
        fileName: d.data,
      };
      this.fileChange.emit(this.result);
      // this.onHide();
    }
  }

  private async openCropper(src: string) {
    const componentProps: any = {
      imgUrl: src,
    };
    if (this.maxCropHeight) {
      componentProps.maxCropHeight = this.maxCropHeight;
    }
    if (this.maxCropWidth) {
      componentProps.maxCropWidth = this.maxCropWidth;
    }
    if (this.minCropBoxWidthPercent) {
      componentProps.minCropBoxWidthPercent = this.minCropBoxWidthPercent;
    }
    const m = await this.modalCtrl.create({
      component: ImgPickerComponent,
      componentProps,
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      this.result = {
        ...this.result,
        imageUrl: src,
        fileName: this.result.name,
        fileValue: result.data.fileValue,
      };
      this.file = this.result;
      this.fileChange.emit(this.file);
    }
  }
}
