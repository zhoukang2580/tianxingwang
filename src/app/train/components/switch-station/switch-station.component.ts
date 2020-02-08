import { TrainService } from "../../train.service";

import {
  EventEmitter,
  Output,
  ViewChild,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  ElementRef
} from "@angular/core";
import { Platform, IonText, ModalController } from "@ionic/angular";
import { Component, OnInit, Input, Renderer2 } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { Subscription } from "rxjs";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { SelectTrainStationModalComponent } from "src/app/tmc/components/select-stations/select-station.component";
@Component({
  selector: "app-switch-station-comp",
  templateUrl: "./switch-station.component.html",
  styleUrls: ["./switch-station.component.scss"],
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
export class SwitchStationComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild("fromCityEle") fromCityEle: IonText;
  @ViewChild("toCityEle") toCityEle: IonText;
  @ViewChild("flightcities") flightcitieEle: ElementRef<HTMLElement>;
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  @Input() disabled = false; // 界面上显示的出发城市
  @Input() isExchange = false; // 界面上显示的出发城市
  @Input() vmFromCity: TrafficlineEntity; // 界面上显示的出发城市
  @Input() vmToCity: TrafficlineEntity; // 界面上显示的目的城市
  isMoving: boolean;
  mode: string;
  @Output() eCities: EventEmitter<{
    vmFrom: TrafficlineEntity;
    vmTo: TrafficlineEntity;
  }>;
  constructor(
    plt: Platform,
    private render: Renderer2,
    private modalCtrl: ModalController
  ) {
    this.mode = plt.is("ios") ? "ios" : plt.is("android") ? "md" : "";
    this.eCities = new EventEmitter();
  }
  onRotateIconDone(evt) {
    console.log("onRotateIconDone");
    this.isMoving = false;
  }
  onRotateIcon() {
    // if(this.isMoving){
    //   return;
    // }
    // this.rotateIcon = !this.rotateIcon; // 控制图标旋转
    this.toggleCities = !this.toggleCities;
    // this.moveEle();
    const temp = this.vmFromCity;
    this.vmFromCity = this.vmToCity;
    this.vmToCity = temp;
    this.eCities.emit({ vmFrom: this.vmFromCity, vmTo: this.vmToCity });
  }

  private moveEle() {
    if (
      this.fromCityEle &&
      this.toCityEle &&
      this.flightcitieEle &&
      this.flightcitieEle.nativeElement
    ) {
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
  ngOnDestroy() {}
  ngOnChanges(changes: SimpleChanges) {
    // console.log("changes", changes);
    // console.log("changes.toCity", changes.vmToCity);
  }
  ngOnInit() {}
  async onSelectCity(fromCity: boolean) {
    if (this.isExchange) {
      if (fromCity) {
        return;
      }
    } else if (this.disabled) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: SelectTrainStationModalComponent
    });
    m.backdropDismiss = false;
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      const data = result.data as TrafficlineEntity;
      if (fromCity) {
        this.vmFromCity = data;
      } else {
        this.vmToCity = data;
      }
      this.eCities.emit({ vmTo: this.vmToCity, vmFrom: this.vmFromCity });
    }
  }
}
