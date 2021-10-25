import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-guarantee-agreement',
  templateUrl: './guarantee-agreement.component.html',
  styleUrls: ['./guarantee-agreement.component.scss'],
})
export class GuaranteeAgreementComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  back() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
}
