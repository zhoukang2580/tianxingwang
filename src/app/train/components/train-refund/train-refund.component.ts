import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-train-refund',
  templateUrl: './train-refund.component.html',
  styleUrls: ['./train-refund.component.scss'],
})
export class TrainRefundComponent implements OnInit {
  Id: string;
  CheckName: string;
  CredentialsNumber: string;
  StartTime: string;
  FromStationName: string;
  ToStationName: string;
  TrainCode: string;
  constructor(private popoverCtrl: PopoverController) { }
  async back(ok = false) {
    const t = await this.popoverCtrl.getTop();
    if (t) {
      t.dismiss(ok).catch(_ => { });
    }
  }
  ngOnInit() { }

}
