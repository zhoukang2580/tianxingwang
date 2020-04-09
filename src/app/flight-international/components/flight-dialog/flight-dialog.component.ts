import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { DirectFlyComponent } from './direct-fly/direct-fly.component';
import { AirCompanyComponent } from './air-company/air-company.component';
import { TakeoffLandingAirportComponent } from './takeoff-landing-airport/takeoff-landing-airport.component';
import { TakeoffTimeComponent } from './takeoff-time/takeoff-time.component';
import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';

@Component({
  selector: 'app-flight-dialog',
  templateUrl: './flight-dialog.component.html',
  styleUrls: ['./flight-dialog.component.scss'],
})
export class FlightDialogComponent implements OnInit {
  @ViewChild(DirectFlyComponent) directfly: DirectFlyComponent;
  @ViewChild(AirCompanyComponent) aircompany: AirCompanyComponent;
  @ViewChild(TakeoffLandingAirportComponent) TakeoffLandingAirport: TakeoffLandingAirportComponent;
  @ViewChild(TakeoffTimeComponent) TakeoffTime: TakeoffTimeComponent;
  tab: number;
  constructor(public modalController: ModalController,
    private menu: MenuController
    ) { }
    ngOnInit() {
      this.tab=1;
    }
    onTabClick(tab: number) {
      this.tab = tab;
    }
    dismiss() {
      // using the injected ModalController this page
      // can "dismiss" itself and optionally pass back data
      this.modalController.dismiss({
        'dismissed': true
      });
    }
    onReset(){
      this.directfly.onReset();
      this.aircompany.onReset();
      this.TakeoffLandingAirport.onReset();
      this.TakeoffLandingAirport.toReset();
      this.TakeoffTime.onReset();
    }
    onCancel(evt?: CustomEvent, confirm = false) {
      this.modalController.getTop().then(t => {
        t.dismiss(confirm);
      })
    }
    onSearch() {
      this.onCancel(null, true);
    }
    async getIsTab(){
      return{

      }
    }
}
