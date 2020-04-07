import { EventEmitter, ElementRef } from "@angular/core";
import { TmcService } from "./../../tmc.service";
import { PopoverController } from "@ionic/angular";
import { Component, OnInit, Input, Output } from "@angular/core";
import { TravelUrlInfo } from "../../tmc.service";
import { SelectTravelNumberComponent } from "../select-travel-number-popover/select-travel-number-popover.component";

@Component({
  selector: "app-book-tmc-outnumber",
  templateUrl: "./book-tmc-outnumber.component.html",
  styleUrls: ["./book-tmc-outnumber.component.scss"]
})
export class BookTmcOutnumberComponent implements OnInit {
  private timer: any;
  nativeElement: HTMLElement;
  @Output() tmcOutNumber: EventEmitter<{
    tmcOutNumberInfos: ITmcOutNumberInfo[];
    tmcOutNumberInfo: ITmcOutNumberInfo;
    travelUrlInfo: TravelUrlInfo;
  }>;
  @Input() isShowGroupedInfo: boolean;
  @Input() isExchange: boolean;
  @Input() tmcOutNumberInfos: ITmcOutNumberInfo[];
  constructor(
    private popoverCtrl: PopoverController,
    private tmcService: TmcService,
    el: ElementRef<HTMLElement>
  ) {
    this.tmcOutNumber = new EventEmitter();
    this.nativeElement = el.nativeElement;
  }
  onChange(arg: ITmcOutNumberInfo) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: {
          TravelNumber: arg.value
        } as any
      });
    }, 300);
  }
  ngOnInit() {}
  async onSelectTravelNumber(arg: ITmcOutNumberInfo) {
    const tmcOutNumberInfos = this.tmcOutNumberInfos;
    if (!arg || !arg.canSelect || this.isExchange || !this.isShowGroupedInfo) {
      return;
    }
    if (!arg.travelUrlInfos || arg.travelUrlInfos.length == 0) {
      tmcOutNumberInfos.forEach(info => {
        info.isLoadingNumber = true;
      });
      const result = await this.tmcService.getTravelUrls(
        [
          {
            staffNumber: arg.staffNumber,
            staffOutNumber: arg.staffOutNumber,
            name: arg.label
          }
        ],
        true
      );
      if (result) {
        tmcOutNumberInfos.forEach(info => {
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
        tmcOutNumberInfos.forEach(info => {
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
      componentProps: {
        travelInfos: arg.travelUrlInfos || []
      },
      translucent: true,
      showBackdrop: true
    });
    await p.present();
    const res = await p.onDidDismiss();
    if (res && res.data) {
      const data = res.data as TravelUrlInfo;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: data
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
  required: boolean;
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
