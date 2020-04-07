import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-flight-dialog',
  templateUrl: './flight-dialog.component.html',
  styleUrls: ['./flight-dialog.component.scss'],
})
export class FlightDialogComponent implements OnInit {

  constructor(public modalController: ModalController,
    private menu: MenuController
    ) { }

  ngOnInit() {}

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  onShowDialog(){

  }
  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }
}
