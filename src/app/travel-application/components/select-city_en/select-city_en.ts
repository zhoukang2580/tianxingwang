import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  IonContent,
  Platform,
  IonRefresher,
  IonHeader,
  ModalController,
  IonInfiniteScroll,
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import * as jsPy from "js-pinyin";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { RefresherComponent } from "src/app/components/refresher";
import { TravelService } from "../../travel.service";
import { finalize } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { SelectCity } from '../select-city/select-city';
interface ICity {
  Id: string;
  // tslint:disable-next-line: ban-types
  Name: String;
}
@Component({
  selector: "app-select-city_en",
  templateUrl: "./select-city_en.html",
  styleUrls: ["./select-city_en.scss"],
})
// tslint:disable-next-line: component-class-suffix
export class SelectCityEn extends SelectCity {

}
