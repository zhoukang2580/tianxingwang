import {
  Component,
} from "@angular/core";
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
import { TravelFormTripEntity } from '../../travel.service';
import { AddStrokeComponent } from '../add-stroke/add-stroke.component';
import { SelectCityEn } from '../select-city_en/select-city_en';
@Component({
  selector: "app-add-stroke_en",
  templateUrl: "./add-stroke_en.component.html",
  styleUrls: ["./add-stroke_en.component.scss"],
})
export class AddStrokeEnComponent extends AddStrokeComponent {
  async onStartingCity(isFrom = true) {
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: SelectCityEn,
      componentProps: {
        tripType: this.trip.TripType,
      },
    });
    m.present();
    const res = await m.onDidDismiss();
    const city: TrafficlineEntity = res && res.data;
    if (city && this.trip) {
      if (isFrom) {
        this.trip.FromCityCode = res.data.Code;
        this.trip.FromCityName =
          res.data.Name + `(${(city.Country && city.Country.Name) || ""})`;
      }
    }
  }
  async onSelectCity(isFrom = true, isMulti, trip: TravelFormTripEntity) {
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: SelectCityEn,
      componentProps: {
        tripType: this.trip.TripType,
        isMulti,
        selectedCitys: trip.ToCities?.map(it=>{
          if(!it.Id){
            it.Id=it.Code;
          }
          return it;
        })
      },
    });

    m.present();
    const res = await m.onDidDismiss();
    const cities: TrafficlineEntity[] = res && res.data;
    const citys = cities && cities.slice(0, 15);
    trip.ToCities = citys;
    if (trip) {
      trip.ToCityCode = trip.ToCities && trip.ToCities.map(it => it.Code).join(",");
      trip.ToCityName = trip.ToCities && trip.ToCities.map(it => it.Name).join(",");
      // trip.ToCityCode = citys.toString();
      trip.toCityNames = trip.ToCities && trip.ToCities.map(it => it.Name).filter(it => !!it && it.length > 0).join(" · ");
    }
  }

  async onSelectCheckInCity(isFrom = true, isMulti, trip: TravelFormTripEntity) {
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: SelectCityEn,
      componentProps: {
        tripType: this.trip.TripType,
        isMulti,
        selectedCitys: trip.ToCityArrive?.map(it=>{
          if(!it.Id){
            it.Id = it.Code;
          }
          return it;
        })
      },
    });

    m.present();
    const res = await m.onDidDismiss();
    const city: TrafficlineEntity = res && res.data;
    const cities: TrafficlineEntity[] = res && res.data;
    const citys = cities && cities.slice(0, 15);
    if (trip) {
      trip.ToCityArrive = citys;
      trip.CheckInCityCode = trip.ToCityArrive && trip.ToCityArrive.map(it => it.Code).join(',');
      trip.CheckInCityName = trip.ToCityArrive && trip.ToCityArrive.map(it => it.Name).join(',');

      trip.toCityInName = trip.ToCityArrive && trip.ToCityArrive.map(it => it.Name).filter(it => !!it && it.length > 0).join(" · ");
    }
  }
}
