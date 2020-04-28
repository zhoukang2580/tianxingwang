import { flyInOut } from "./../../../animations/flyInOut";
import {
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { TmcService } from "./../../tmc.service";
import { PopoverController, IonInput, IonList } from "@ionic/angular";
import { Component, OnInit, Input, Output } from "@angular/core";
import { TravelUrlInfo } from "../../tmc.service";
import { SelectTravelNumberComponent } from "../select-travel-number-popover/select-travel-number-popover.component";
import { Subscription, fromEvent } from "rxjs";
@Component({
  selector: "app-book-tmc-outnumber",
  templateUrl: "./book-tmc-outnumber.component.html",
  styleUrls: ["./book-tmc-outnumber.component.scss"],
  animations: [flyInOut],
})
export class BookTmcOutnumberComponent
  implements OnInit, OnDestroy, AfterViewInit {
  private timer: any;
  private subscriptions: Subscription[] = [];

  nativeElement: HTMLElement;
  @Output() tmcOutNumber: EventEmitter<{
    tmcOutNumberInfos: ITmcOutNumberInfo[];
    tmcOutNumberInfo: ITmcOutNumberInfo;
    travelUrlInfo: TravelUrlInfo;
  }>;
  @Input() isShowGroupedInfo: boolean;
  @Input() isExchange: boolean;
  @Input() tmcOutNumberInfos: ITmcOutNumberInfo[];
  vmTmcOutNumberInfos: ITmcOutNumberInfo[];
  travelNumbers: ITmcOutNumberInfo[];
  @ViewChild("hintEl") hintEl: ElementRef<IonList>;
  hints: string[];
  constructor(
    private popoverCtrl: PopoverController,
    private tmcService: TmcService,
    el: ElementRef<HTMLElement>
  ) {
    this.tmcOutNumber = new EventEmitter();
    this.nativeElement = el.nativeElement;
  }
  onSelectText(str: string) {
    console.log("onSelectText", str);
    const one =
      this.tmcOutNumberInfos &&
      this.tmcOutNumberInfos.find((it) => it.hasfocus);
    this.hints = [];
    if (one) {
      one.hasfocus = false;
      one.value = str;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: one,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: {
          TravelNumber: one.value,
        } as any,
      });
    }
  }
  onFocus(n: ITmcOutNumberInfo) {
    this.vmTmcOutNumberInfos = this.vmTmcOutNumberInfos.map((it) => {
      it.hasfocus = it.label == n.label;
      return it;
    });
    this.onChange(n, { detail: { value: "" } } as any);
  }
  onBlur(arg: ITmcOutNumberInfo) {
    setTimeout(() => {
      this.hints = [];
      arg.hasfocus = false;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: {
          TravelNumber: arg.value,
        } as any,
      });
    }, 0);
  }
  onChange(arg: ITmcOutNumberInfo, evt: CustomEvent) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      const hints = (arg.labelDataList || []).filter((it) => !!it);
      this.hints = hints.filter((it) =>
        evt.detail.value
          ? it.toLowerCase().includes(evt.detail.value.trim())
          : true
      );
      if (this.hints.length == 1 && this.hints[0] == arg.value) {
        this.hints = [];
      }
    }, 300);
  }
  compareWithFn(o1: string, o2: string) {
    return o1 == o2;
  }
  ngAfterViewInit() {}
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    if (this.tmcOutNumberInfos) {
      this.travelNumbers = this.tmcOutNumberInfos.filter(
        (it) => it.label && it.label.toLowerCase() == "travelnumber"
      );
      this.vmTmcOutNumberInfos = this.tmcOutNumberInfos.filter((it) =>
        this.travelNumbers.length
          ? !this.travelNumbers.some((a) => a.label == it.label)
          : true
      );
    }
  }
  async onSelectTravelNumber(arg: ITmcOutNumberInfo) {
    const tmcOutNumberInfos = this.tmcOutNumberInfos;
    if (!arg || !arg.canSelect || this.isExchange || !this.isShowGroupedInfo) {
      return;
    }
    if (!arg.travelUrlInfos || arg.travelUrlInfos.length == 0) {
      tmcOutNumberInfos.forEach((info) => {
        info.isLoadingNumber = true;
      });
      const result = await this.tmcService.getTravelUrls(
        [
          {
            staffNumber: arg.staffNumber,
            staffOutNumber: arg.staffOutNumber,
            name: arg.label,
          },
        ],
        true
      );
      if (result) {
        tmcOutNumberInfos.forEach((info) => {
          info.loadTravelUrlErrorMsg =
            result[info.staffNumber] && result[info.staffNumber].Message;
          info.travelUrlInfos =
            result[info.staffNumber] && result[info.staffNumber].Data;
          if (
            !info.value &&
            info.travelUrlInfos &&
            info.travelUrlInfos.length
          ) {
            info.value = info.travelUrlInfos[0].TravelNumber;
          }
          info.isLoadingNumber = false;
        });
      } else {
        tmcOutNumberInfos.forEach((info) => {
          info.isLoadingNumber = false;
        });
      }
    }
    if (!arg.travelUrlInfos || arg.travelUrlInfos.length == 0) {
      return;
    }
    console.log("on select travel number", arg);
    const p = await this.popoverCtrl.create({
      component: SelectTravelNumberComponent,
      cssClass: "ticket-changing",
      componentProps: {
        travelInfos: arg.travelUrlInfos || [],
      },
      translucent: true,
      showBackdrop: true,
    });
    await p.present();
    const res = await p.onDidDismiss();
    if (res && res.data) {
      const data = res.data as TravelUrlInfo;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: data,
      });
      // if (data) {
      //   if (data.CostCenterCode) {
      //     item.costCenter.code = data.CostCenterCode;
      //   }
      //   if (data.CostCenterName) {
      //     item.costCenter.name = data.CostCenterName;
      //   }
      //   if (data.OrganizationCode) {
      //     item.organization.Code = data.OrganizationCode;
      //   }
      //   if (data.OrganizationName) {
      //     item.organization.Name = data.OrganizationName;
      //   }
      //   if (data.TravelNumber) {
      //     arg.value = data.TravelNumber;
      //   }
      // }
    }
  }
}
export interface ITmcOutNumberInfo {
  key: string;
  label: string;
  labelDataList: string[];
  required: boolean;
  hasfocus: boolean;
  value: string;
  staffOutNumber: string;
  isTravelNumber: boolean;
  isLoadNumber: boolean;
  isLoadingNumber: boolean;
  staffNumber: string;
  canSelect: boolean;
  isDisabled: boolean;
  travelUrlInfos: TravelUrlInfo[];
  loadTravelUrlErrorMsg: string;
}
