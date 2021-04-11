import { OrderEntity } from 'src/app/order/models/OrderEntity';
import { StaffEntity } from './../../../hr/staff.service';
import { TrainEntity } from 'src/app/train/models/TrainEntity';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-train-refund',
  templateUrl: './train-refund.component.html',
  styleUrls: ['./train-refund.component.scss'],
})
export class TrainRefundComponent implements OnInit {
  train: TrainEntity;
  order: OrderEntity;
  Id: string;
  Name: string;
  CredentialsNumber: string;
  HideCredentialsNumber: string;
  StartTime: string;
  ArrivalTime: string;
  FromStationName: string;
  ToStationName: string;
  TrainCode: string;
  passenger: StaffEntity;
  constructor(private popoverCtrl: PopoverController) { }
  async back(ok = false) {
    const t = await this.popoverCtrl.getTop();
    if (t) {
      t.dismiss(ok).catch(_ => { });
    }
  }
  ngOnInit() {
    this.train = new TrainEntity();
    this.passenger = new StaffEntity();
    this.order = new OrderEntity();
    this.order.Id = this.Id;
    this.train.FromStationName = this.FromStationName;
    this.train.ToStationName = this.ToStationName;
    this.train.ArrivalTime = this.ArrivalTime;
    this.train.StartTime = this.StartTime;
    this.train.TrainCode = this.TrainCode;
    this.passenger.HideCredentialsNumber = this.HideCredentialsNumber;
    this.passenger.Name = this.Name;
  }

}
