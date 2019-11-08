import { FlightService } from "src/app/flight/flight.service";
import {
  EventEmitter,
  Output,
  ViewChild,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  ElementRef
} from "@angular/core";
import { Platform, IonText } from "@ionic/angular";
import { Component, OnInit, Input, Renderer2 } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { Subscription } from "rxjs";
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';

@Component({
  selector: "app-switch-city-comp",
  templateUrl: "./switch-city.component.html",
  styleUrls: ["./switch-city.component.scss"],
  animations: [
    trigger("rotateIcon", [
      state(
        "*",
        style({
          transform: "rotateZ(45deg) scale(1)",
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
export class SwitchCityComponent implements OnInit, OnDestroy, OnChanges {
  private selectCitySubscription = Subscription.EMPTY;
  @ViewChild("fromCityEle") fromCityEle: IonText;
  @ViewChild("toCityEle") toCityEle: IonText;
  @ViewChild("flightcitieEle") flightcitieEle: ElementRef<HTMLElement>;
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  @Input() disabled = false; // 界面上显示的出发城市
  @Input() vmFromCity: TrafficlineEntity; // 界面上显示的出发城市
  @Input() vmToCity: TrafficlineEntity; // 界面上显示的目的城市
  isSelectFromCity: boolean;
  isMoving: boolean;
  mode: string;
  @Output() eCity: EventEmitter<{ vmFromCity: TrafficlineEntity; vmToCity: TrafficlineEntity; }>;
  constructor(
    plt: Platform,
    private flightService: FlightService,
    private render: Renderer2
  ) {
    this.mode = plt.is("ios") ? "ios" : plt.is("android") ? "md" : "";
    this.eCity = new EventEmitter();
  }
  onRotateIconDone(evt) {
    console.log("onRotateIconDone");
    this.isMoving = false;
  }
  onRotateIcon() {
    if (this.disabled) {
      return;
    }
    this.rotateIcon = !this.rotateIcon; // 控制图标旋转
    this.toggleCities = !this.toggleCities;
    const temp = this.vmFromCity;
    this.vmFromCity = this.vmToCity;
    this.vmToCity = temp;
    this.eCity.emit({
      vmFromCity: this.vmFromCity,
      vmToCity: this.vmToCity
    });
    console.log("出发城市：", this.vmFromCity.Nickname);
    console.log("目的城市：", this.vmToCity.Nickname);
    // this.moveEle();
  }
  private moveEle() {
    if (this.fromCityEle && this.toCityEle && this.flightcitieEle && this.flightcitieEle.nativeElement) {
      // console.log(this.fromCityEle, this.toCityEle);
      const rect = this.flightcitieEle.nativeElement.getBoundingClientRect();
      const fEle = this.fromCityEle["el"];
      const tEle = this.toCityEle["el"];
      const fRect = fEle && fEle.getBoundingClientRect();
      const tRect = tEle && tEle.getBoundingClientRect();
      if (rect && fRect && tRect) {
        const moveFromEleDelta = rect.width - fRect.width;
        const moveToEleDetal = rect.width - tRect.width;
        // console.log(`fele`, moveFromEleDetal);
        // console.log(`tele`, moveToEleDetal);
        this.render.setStyle(
          fEle,
          "transform",
          `translateX(${this.toggleCities ? moveFromEleDelta : 0}px)`
        );
        this.render.setStyle(
          tEle,
          "transform",
          `translateX(${this.toggleCities ? -moveToEleDetal : 0}px)`
        );
      }
    }
  }
  ngOnDestroy() {
    this.selectCitySubscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    console.log("changes.toCity", changes.vmToCity);
  }
  ngOnInit() {
    this.selectCitySubscription = this.flightService
      .getSelectedCity()
      .subscribe(c => {
        if (c) {
          if (this.isSelectFromCity) {
            this.vmFromCity = c;
          } else {
            this.vmToCity = c;
          }
          this.eCity.emit({vmFromCity:this.vmFromCity,vmToCity:this.vmToCity});
        }
      });
  }
  onSelectCity(fromCity: boolean) {
    if (this.disabled) {
      return;
    }
    this.flightService.setOpenCloseSelectCityPageSources(true);
    this.isSelectFromCity = fromCity;
  }
}
