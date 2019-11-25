import { ModalController } from '@ionic/angular';
import { IFlightSegmentInfo } from './../../models/PassengerFlightInfo';
import { PassengerBookInfo } from './../../../tmc/tmc.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-select-and-replacebookinfo',
  templateUrl: './select-and-replacebookinfo.component.html',
  styleUrls: ['./select-and-replacebookinfo.component.scss'],
})
export class SelectAndReplacebookinfoComponent implements OnInit {
  bookInfos: { info: PassengerBookInfo<IFlightSegmentInfo>, isSelected: boolean; }[];
  selectedItems: PassengerBookInfo<IFlightSegmentInfo>[] = [];
  constructor(private modal: ModalController) { }
  back() {
    this.modal.dismiss(this.selectedItems);
  }
  ngOnInit() {

  }
  onionChange(it: PassengerBookInfo<IFlightSegmentInfo>) {
    this.bookInfos = this.bookInfos.map(info => {
      info.isSelected = it.id == info.info.id;
      return info;
    })
    if (!this.selectedItems.find(item => item.id == it.id)) {
      this.selectedItems.push(it);
    }
  }
  onConfirm() {

  }
  onCancel() {
    this.selectedItems = [];
    this.back();
  }
}
