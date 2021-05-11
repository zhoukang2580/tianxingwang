// import { InternationalFlightService } from "../international-flight/international-flight.service";
import { EventEmitter, Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { BehaviorSubject } from "rxjs";
import { finalize } from "rxjs/operators";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { Router } from "@angular/router";
import { FlightService } from "../flight/flight.service";
import { FlightCityService } from "../flight/flight-city.service";
@Injectable({
  providedIn: "root",
})
export class FlightDynamicCityService {
  constructor(private fls:FlightCityService){}
  async onSelectCity(isShow, isFrom, isDomestic = true) 
}
