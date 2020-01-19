import { AppHelper } from "./../appHelper";
import { BehaviorSubject } from "rxjs";
import { Subject } from "rxjs";
import { ApiService } from "./../services/api/api.service";
import { RequestEntity } from "./../services/api/Request.entity";
import { TrafficlineEntity } from "./../tmc/models/TrafficlineEntity";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { CountryEntity } from "../tmc/models/CountryEntity";
export const KEY_INTERNATIONAL_HOTEL_CITIES = "key_international_hotel_cities";
@Injectable({
  providedIn: "root"
})
export class InternationalHotelService {
  private searchConditon: IInterHotelSearchCondition;
  private searchConditionSource: Subject<IInterHotelSearchCondition>;
  private cities: TrafficlineEntity[];
  private fetchCities: { promise: Promise<TrafficlineEntity[]> };
  constructor(private apiService: ApiService, private storage: Storage) {
    this.searchConditionSource = new BehaviorSubject(null);
  }
  async getCities(forceFetch = false) {
    if (!forceFetch) {
      if (!this.cities || this.cities.length == 0) {
        this.cities = await this.getLocalCities();
      }
      if (this.cities && this.cities.length) {
        return Promise.resolve(this.cities);
      }
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = ``;
    req.Data = {};
    if (this.fetchCities && this.fetchCities.promise) {
      return this.fetchCities.promise;
    }
    this.fetchCities = {
      promise: this.apiService
        .getPromiseData<TrafficlineEntity[]>(req)
        .then(res => {
          this.cities = res;
          this.cacheCities(this.cities);
          return res;
        })
        .finally(() => {
          this.fetchCities = null;
        })
    };
    return this.fetchCities.promise;
  }
  private async cacheCities(cities: TrafficlineEntity[]) {
    if (AppHelper.isApp() && cities && cities.length) {
      await this.storage.set(KEY_INTERNATIONAL_HOTEL_CITIES, cities);
    }
  }
  private async getLocalCities(): Promise<TrafficlineEntity[]> {
    let result: TrafficlineEntity[] = [];
    if (AppHelper.isApp()) {
      result = (await this.storage.get(KEY_INTERNATIONAL_HOTEL_CITIES)) || [];
    }
    return result;
  }
  getSearchCondition() {
    return { ...this.searchConditon };
  }
  setSearchConditionSource(condition: IInterHotelSearchCondition) {
    this.searchConditon = condition;
    this.searchConditionSource.next(condition);
  }
  getSearchConditionSource() {
    return this.searchConditionSource.asObservable();
  }
}
export interface IInterHotelSearchCondition {
  checkinDate: string;
  checkoutDate: string;
  destinationCity: TrafficlineEntity;
  country: CountryEntity;
}
