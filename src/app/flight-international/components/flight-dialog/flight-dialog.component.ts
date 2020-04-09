import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { DirectFlyComponent } from './direct-fly/direct-fly.component';
import { AirCompanyComponent } from './air-company/air-company.component';
import { TakeoffLandingAirportComponent } from './takeoff-landing-airport/takeoff-landing-airport.component';
import { TakeoffTimeComponent } from './takeoff-time/takeoff-time.component';
import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
import { IFilterCondition, InternationalFlightService } from '../../international-flight.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-dialog',
  templateUrl: './flight-dialog.component.html',
  styleUrls: ['./flight-dialog.component.scss'],
})
export class FlightDialogComponent implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @ViewChild(DirectFlyComponent) directfly: DirectFlyComponent;
  @ViewChild(AirCompanyComponent) aircompany: AirCompanyComponent;
  @ViewChild(TakeoffLandingAirportComponent) TakeoffLandingAirport: TakeoffLandingAirportComponent;
  @ViewChild(TakeoffTimeComponent) TakeoffTime: TakeoffTimeComponent;
  tab: number;
  condition: IFilterCondition;
  selectInfo: {
    aircompony: boolean;
    fromAir: boolean;
    toAir: boolean;
    timeSpan: boolean;
    isDirect: boolean;
  }
  constructor(public modalController: ModalController,
    private flightService: InternationalFlightService
  ) { }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.tab = 1;
    this.subscription = this.flightService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.condition = c;
        this.selectInfo = {
          isDirect: c.isDirectFly,
          aircompony: c.airComponies && c.airComponies.some(it => it.isChecked),
          fromAir: c.fromAirports && c.fromAirports.some(it => it.isChecked),
          toAir: c.toAirports && c.toAirports.some(it => it.isChecked),
          timeSpan: c.timeSpan && c.timeSpan && (c.timeSpan.lower > 0 || c.timeSpan.upper < 24)
        }
      });
  }
  onTabClick(tab: number) {
    this.tab = tab;
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.onReset();
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  onReset() {
    this.directfly.onReset();
    this.aircompany.onReset();
    this.TakeoffLandingAirport.onReset();
    this.TakeoffLandingAirport.toReset();
    this.TakeoffTime.onReset();
  }
  private onCancel(evt?: CustomEvent, confirm = false) {
    this.modalController.getTop().then(t => {
      t.dismiss(confirm);
    })
  }
  onSearch() {
    this.onCancel(null, true);
  }
}
