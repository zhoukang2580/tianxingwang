import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
} from "@angular/core";
import { TravelFormTripEntity, TravelService } from "../../travel.service";
import { ModalController, IonSelect } from "@ionic/angular";
import { SelectCity } from "../select-city/select-city";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-add-stroke",
  templateUrl: "./add-stroke.component.html",
  styleUrls: ["./add-stroke.component.scss"],
})
export class AddStrokeComponent implements OnInit {
  @Output() remove: EventEmitter<any>;
  @Input() trip: TravelFormTripEntity;
  @Input() index: number;
  constructor(
    private service: TravelService,
    private modalCtrl: ModalController
  ) {
    this.remove = new EventEmitter();
  }
  compareTravelToolWithFn = (o1: string, o2: string[]) => {
    return o1 && o2 && o2.includes(o1);
  };
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  ngOnInit() {
    this.trip.StartDate = new Date().toISOString();
    this.trip.EndDate = new Date().toISOString();
  }
  onDelete() {
    this.remove.emit(this.trip);
  }
  onGetCities() {
    // return this.service.getCities();
  }
  getNumberOfDays(date1, date2) {
    if (!date1 || !date2) {
      return;
    }
    AppHelper.getDate(date1);
    AppHelper.getDate(date2);
    var a1 = AppHelper.getDate(date1.substr(0, 10)).getTime();
    var a2 = AppHelper.getDate(date2.substr(0, 10)).getTime();
    var day = (a2 - a1) / (1000 * 60 * 60 * 24); //核心：时间戳相减，然后除以天数
    // this.days=day
    day += 1;
    if (this.trip) {
      this.trip.Day = day;
    }
    return day;
  }
  async onSelectCity(isFrom = true) {
    const m = await this.modalCtrl.create({ component: SelectCity });
    m.present();
    const res = await m.onDidDismiss();
    if (res && res.data && this.trip) {
      if (isFrom) {
        this.trip.FromCityCode = res.data.Code;
        this.trip.FromCityName = res.data.Name;
      } else {
        this.trip.ToCityCode = res.data.Code;
        this.trip.ToCityName = res.data.Name;
      }
    }
  }
}
