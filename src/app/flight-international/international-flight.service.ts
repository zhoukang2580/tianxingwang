import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";

@Injectable({
  providedIn: "root"
})
export class InternationalFlightService {
  constructor(private apiService: ApiService) {}
}
export interface ISearchInternationalFlightModel {
  FromAirport: string;
  ToAirport: string;
  Date: string;
  VoyageType: FlightVoyageType;
}
export enum FlightVoyageType {
  OneWay = 1,
  GoBack = 2,
  MultiCity = 2
}
