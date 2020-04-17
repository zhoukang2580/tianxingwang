import {
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { TmcService } from "./../../tmc.service";
import { PopoverController, IonInput } from "@ionic/angular";
import { Component, OnInit, Input, Output } from "@angular/core";
import { TravelUrlInfo } from "../../tmc.service";
import { SelectTravelNumberComponent } from "../select-travel-number-popover/select-travel-number-popover.component";
import { Subscription, fromEvent } from "rxjs";
@Component({
  selector: "app-book-tmc-outnumber",
  templateUrl: "./book-tmc-outnumber.component.html",
  styleUrls: ["./book-tmc-outnumber.component.scss"],
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
  @ViewChildren("numberInputEle") numberInputEles: QueryList<IonInput>;
  hints: string[];
  constructor(
    private popoverCtrl: PopoverController,
    private tmcService: TmcService,
    el: ElementRef<HTMLElement>
  ) {
    this.tmcOutNumber = new EventEmitter();
    this.nativeElement = el.nativeElement;
  }
  onSelect(str: string) {
    const one = this.tmcOutNumberInfos.find((it) => it.hasfocus);
    if (one) {
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
  onBlur(arg: ITmcOutNumberInfo) {
    setTimeout(() => {
      arg.hasfocus = false;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: {
          TravelNumber: arg.value,
        } as any,
      });
    }, 100);
  }
  onChange(arg: ITmcOutNumberInfo, evt: CustomEvent) {
    arg.hasfocus = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      const hints = (arg.labelDataList || []).filter((it) => !!it);
      this.hints = hints.filter((it) =>
        evt.detail.value ? it.toLowerCase().includes(evt.detail.value) : true
      );
    }, 300);
  }
  ngAfterViewInit() {
    this.numberInputEles.changes.subscribe(() => {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.numberInputEles
        .filter((it) => it["el"] && it["el"].hasAttribute("has-data"))
        .forEach((el) => {
          this.subscriptions.push(
            el.ionBlur.subscribe(() => {
              const ele = document.getElementById("tmc-out-number-ele");
              document.removeChild(ele);
            })
          );
          this.subscriptions.push(
            el.ionFocus.subscribe(() => {
              const target = el["el"];
              const p = target && target.parentElement;
              if (target) {
                const one = this.tmcOutNumberInfos.find(
                  (it) => it.label == target.getAttribute("label")
                );
                if (one && one.labelDataList && one.labelDataList.length) {
                  const rect = target.getBoundingClientRect();
                  const prect = p.getBoundingClientRect();
                  if (rect) {
                    let ele = document.getElementById("tmc-out-number-ele");
                    if (!ele) {
                      ele = document.createElement("div");
                      ele.id = "tmc-out-number-ele";
                      ele.style.position = "absolute";
                      ele.style.left = "0";
                      ele.style.right = "0";
                    }
                    one.labelDataList.forEach((str, idx) => {
                      const div = document.createElement("div");
                      div.style.padding = "0.5em";
                      if (idx != one.labelDataList.length - 1) {
                        div.style.borderBottom = `rgba(var(--ion-color-dark-rgb),0.13)`;
                      }
                      div.textContent = str;
                      ele.appendChild(div);
                    });
                    ele.style.top = rect.top + "px";
                  }
                }
              }
            })
          );
        });
    });
  }
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
