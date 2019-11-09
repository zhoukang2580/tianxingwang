import { EventEmitter } from '@angular/core';
import { TmcService } from './../../tmc.service';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit, Input, Output } from '@angular/core';
import { TravelUrlInfo } from '../../tmc.service';
import { SelectTravelNumberComponent } from '../select-travel-number-popover/select-travel-number-popover.component';

@Component({
  selector: 'app-book-tmc-outnumber',
  templateUrl: './book-tmc-outnumber.component.html',
  styleUrls: ['./book-tmc-outnumber.component.scss'],
})
export class BookTmcOutnumberComponent implements OnInit {
  @Output() tmcOutNumber: EventEmitter<{
    tmcOutNumberInfos: ITmcOutNumberInfo[];
    tmcOutNumberInfo: ITmcOutNumberInfo,
    travelUrlInfo: TravelUrlInfo
  }>;
  @Input() tmcOutNumberInfos: ITmcOutNumberInfo[];
  constructor(private popoverCtrl: PopoverController, private tmcService: TmcService) {
    this.tmcOutNumber=new EventEmitter();
   }

  ngOnInit() { }
  async onSelectTravelNumber(arg: ITmcOutNumberInfo) {
    const tmcOutNumberInfos = this.tmcOutNumberInfos;
    if (!arg || !arg.canSelect || !tmcOutNumberInfos) {
      return;
    }
    if (!arg.travelUrlInfos || arg.travelUrlInfos.length == 0) {
      tmcOutNumberInfos.forEach(info => {
        info.isLoadingNumber = true;
      })
      const result = await this.tmcService.getTravelUrls([{
        staffNumber: arg.staffNumber,
        staffOutNumber: arg.staffOutNumber,
        name: arg.label
      }],true);
      if (result) {
        tmcOutNumberInfos.forEach(info => {
          info.travelUrlInfos = result[info.staffNumber];
          if (
            !info.value &&
            info.travelUrlInfos &&
            info.travelUrlInfos.length
          ) {
            info.value = info.travelUrlInfos[0].TravelNumber;
          }
          info.canSelect = !!(
            info.travelUrlInfos && info.travelUrlInfos.length
          ); // && info.canSelect;
          info.isLoadingNumber = false;
        })
      } else {
        tmcOutNumberInfos.forEach(info => {
          info.isLoadingNumber = false;
        })
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
    const result = await p.onDidDismiss();
    if (result && result.data) {
      const data = result.data as TravelUrlInfo;
      this.tmcOutNumber.emit({
        tmcOutNumberInfo: arg,
        tmcOutNumberInfos: this.tmcOutNumberInfos,
        travelUrlInfo: data
      })
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
}