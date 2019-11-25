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
  bookInfos: { info: PassengerBookInfo<IFlightSegmentInfo>, isSelected: boolean; }[] = [];
  selectedItems: PassengerBookInfo<IFlightSegmentInfo>[] = [];
  constructor(private modal: ModalController) { }
  back() {
    this.selectedItems = this.selectedItems.concat(this.bookInfos.filter(it => it.isSelected).map(it => it.info));
    console.log("SelectAndReplacebookinfoComponent",this.selectedItems);
    this.modal.dismiss(this.selectedItems);
  }
  ngOnInit() {

  }
  onConfirm() {
    this.back();
  }
  onCancel() {
    this.selectedItems = [];
    this.back();
  }
}
