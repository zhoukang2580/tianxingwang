import { FlightService } from 'src/app/flight/flight.service';
import { EventEmitter, Output } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Component, OnInit, Input } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { Subscription } from "rxjs";
import { FlyCityItemModel } from '../select-city/models/TrafficlineModel';

@Component({
  selector: "app-switch-city-comp",
  templateUrl: "./switch-city.component.html",
  styleUrls: ["./switch-city.component.scss"],
  animations: [
    trigger("rotateIcon", [
      state(
        "*",
        style({
          transform: "rotateZ(0) scale(1)",
          opacity: 1
        })
      ),
      transition(
        "false <=> true",
        animate(
          "500ms ease-in",
          style({
            transform: "rotateZ(360deg) scale(1.1)",
            opacity: 0.6
          })
        )
      )
    ])
  ]
})
export class SwitchCityComponent implements OnInit {
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  @Input()
  vmFromCity: FlyCityItemModel; // 界面上显示的出发城市
  @Input()
  vmToCity: FlyCityItemModel; // 界面上显示的目的城市
  fromCity: FlyCityItemModel; // 城市切换后，真实的出发城市
  toCity: FlyCityItemModel; // 切换后，真实的目的城市
  isSelectFromCity: boolean;
  isMoving: boolean;
  selectCitySub = Subscription.EMPTY;
  mode: string;
  @Output()
  eFromCity: EventEmitter<FlyCityItemModel>;
  @Output()
  eToCity: EventEmitter<FlyCityItemModel>;
  constructor( plt: Platform,private flightService:FlightService) {
    this.mode = plt.is("ios") ? "ios" : plt.is("android") ? "md" : "";
    this.eFromCity = new EventEmitter();
    this.eToCity = new EventEmitter();
  }
  onRotateIconDone(evt) {
    console.log("onRotateIconDone");
    this.isMoving = false;
  }
  onRotateIcon() {
    if (this.isMoving) {
      return;
    }
    this.isMoving = true;
    this.rotateIcon = !this.rotateIcon; // 控制图标旋转
    this.toggleCities = !this.toggleCities;
    // 需要将城市切换
    const temp = this.toCity;
    this.toCity = this.fromCity;
    this.fromCity = temp;
    if (this.fromCity) {
      this.eFromCity.emit(this.fromCity);
    }
    if (this.toCity) {
      this.eToCity.emit(this.toCity);
    }
  }
  ngOnInit() {
    
  }
  onSelectCity(fromCity: boolean) {
    // console.log(this.isMoving);
    if (this.isMoving) {
      // 如果切换城市的动画还在进行
      return;
    }
    this.flightService.setOpenCloseSelectCityPageSources(true);
    this.isSelectFromCity = fromCity;
  }
}
