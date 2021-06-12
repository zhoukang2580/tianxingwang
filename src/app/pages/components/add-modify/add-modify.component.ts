import { ElementRef, TemplateRef } from "@angular/core";
import {
  Component,
  OnInit,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { Subscription } from "rxjs";
import { IonContent, ModalController } from "@ionic/angular";
import { ParamMap } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { ImgControlComponent } from "src/app/components/img-control/img-control.component";
interface IDataSource {
  text: string;
  value: string;
}
export interface IConfig {
  label: string;
  type:
    | "text"
    | "tpmRef"
    | "date"
    | "datetime"
    | "textarea"
    | "number"
    | "tel"
    | "email"
    | "select"
    | "file"
    | "openmodal";
  objPro: string;
  tplRef?: TemplateRef<any>;
  validateName?: string;
  order?: number;
  compareWith?: (a: any, b: any) => boolean;
  selectDataList?: IDataSource[];
}
@Component({
  selector: "app-add-modify",
  templateUrl: "./add-modify.component.html",
  styleUrls: ["./add-modify.component.scss"],
})
export class AddModifyComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private subscription = Subscription.EMPTY;
  @ViewChild("container") container: ElementRef<HTMLElement>;
  @Output() cancel: EventEmitter<any>;
  @Output() confirm: EventEmitter<any>;
  @Output() openModal: EventEmitter<any>;
  @Output() beforeCheckObjPropertiy: EventEmitter<any>;
  @Input() items: IConfig[];
  @Input() validateName: string;
  @Input() title = "新增";
  @Input() obj: any;
  @Output() objChange: EventEmitter<any>;
  @Input() isAdd = true;
  hasFocus = false;
  hasFocusEle: HTMLElement;
  private preModifyObjPro: any;
  curModifyObjPro: any;
  constructor(
    private validatorService: ValidatorService,
    private modalCtrl: ModalController
  ) {
    this.cancel = new EventEmitter();
    this.confirm = new EventEmitter();
    this.objChange = new EventEmitter();
    this.openModal = new EventEmitter();
    this.beforeCheckObjPropertiy = new EventEmitter();
  }
  onKey(k: number | ".") {
    if (this.curModifyObjPro) {
      const a = this.obj[this.curModifyObjPro.objPro];
      if (this.obj) {
        if (+k) {
          this.obj[this.curModifyObjPro.objPro] += `${k}`;
        } else if (a && !`${a}`.includes(".")) {
          this.obj[this.curModifyObjPro.objPro] += `${k}`;
        }
      }
    }
  }
  onBlur(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.hasFocus = false;
  }
  onDone() {
    this.hasFocus = false;
    if (this.curModifyObjPro && this.obj) {
      this.obj[this.curModifyObjPro.objPro] =
        this.obj[this.curModifyObjPro.objPro] ||
        this.curModifyObjPro.preValue ||
        "";
    }
  }
  onClear() {
    if (this.curModifyObjPro) {
      if (this.obj) {
        this.curModifyObjPro.value = "";
        this.curModifyObjPro.preValue = "";
        this.obj[this.curModifyObjPro.objPro] = "";
      }
    }
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.isAdd) {
      if (this.container && this.container["el"]) {
        this.validateEl();
      }
    }
    if (changes && changes.items && changes.items.currentValue) {
      this.items = this.items.map((it) => {
        if (!it.validateName) {
          it.validateName = it.objPro;
        }
        return it;
      });
      console.log(this.items);
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.validateEl();
    }, 200);
  }
  onInputNumber(itm: IConfig, ele?: any) {
    this.hasFocusEle = ele;
    if (
      this.preModifyObjPro &&
      this.preModifyObjPro.objPro &&
      this.preModifyObjPro.objPro != itm.objPro
    ) {
      this.curModifyObjPro = this.preModifyObjPro;
      this.onDone();
    }
    requestAnimationFrame(() => {
      if (this.obj) {
        this.curModifyObjPro = {
          value: this.obj[itm.objPro],
          preValue: this.obj[itm.objPro],
          objPro: itm.objPro,
        };
        this.obj[itm.objPro] = "";
        this.preModifyObjPro = this.curModifyObjPro;
      }
      this.hasFocus = true;
    });
  }
  async onViewPic(src: string) {
    const m = await this.modalCtrl.create({
      component: ImgControlComponent,
      componentProps: {
        imgUrl: src,
        isViewImage: true,
      },
    });
    m.present();
  }
  private validateEl() {
    const eles = this.container.nativeElement.getElementsByTagName("input");
    const textareas = this.container.nativeElement.getElementsByTagName(
      "textarea"
    );
    if (eles) {
      for (let i = 0; i < eles.length; i++) {
        const el = eles.item(i);
        el.setAttribute(
          "ValidateName",
          el.parentElement.getAttribute("ValidateName")
        );
        el.setAttribute("Name", el.parentElement.getAttribute("ValidateName"));
        this.validatorService.initialize(
          this.validateName,
          this.isAdd ? "Add" : "Modify",
          el.parentElement
        );
      }
    }
    if (textareas) {
      for (let i = 0; i < textareas.length; i++) {
        const el = textareas.item(i);
        el.setAttribute(
          "ValidateName",
          el.parentElement.getAttribute("ValidateName")
        );
        el.setAttribute("Name", el.parentElement.getAttribute("ValidateName"));
        this.validatorService.initialize(
          this.validateName,
          this.isAdd ? "Add" : "Modify",
          el.parentElement
        );
      }
    }
  }
  onOpenModal(itm: IConfig) {
    this.openModal.emit(itm);
  }
  onCancel() {
    this.cancel.emit();
  }
  private onCheckingObjPropertiy() {
    this.objChange.emit(this.obj);
    this.beforeCheckObjPropertiy.emit(this.obj);
  }
  onConfirm() {
    this.onCheckingObjPropertiy();
    requestAnimationFrame(() => {
      const errorMsg = this.validatorService.checkObjPropertiy(
        this.obj,
        this.validateName,
        this.isAdd ? "Add" : "Modify",
        this.container.nativeElement
      );
      if (errorMsg) {
        AppHelper.alert(errorMsg);
        return;
      }
      this.confirm.emit(true);
    });
  }
}
