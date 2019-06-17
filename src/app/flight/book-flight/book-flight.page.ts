import { AppHelper } from 'src/app/appHelper';
import { SelectDatetimePage } from "./../select-datetime/select-datetime.page";
import { CityService } from "../select-city/city.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { DayModel } from "../models/DayModel";
import { SelectDateService } from "../select-datetime/select-date.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { FlyCityItemModel } from "../select-city/models/CityItemModel";
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
@Component({
  selector: "app-book-flight",
  templateUrl: "./book-flight.page.html",
  styleUrls: ["./book-flight.page.scss"]
})
export class BookFlightPage implements OnInit, OnDestroy, AfterViewInit {
  toggleCities = false; // 没有切换城市顺序
  rotateIcon = false;
  single: boolean;
  isSelectFromCity: boolean;
  isSelectFlyDate: boolean;
  flyDate: DayModel;
  backDate: DayModel;
  totalFlyDays: number;
  selectDaySub = Subscription.EMPTY;
  selectCitySub = Subscription.EMPTY;
  isMoving: boolean;
  vmFromCity: FlyCityItemModel; // 城市切换后，真实的出发城市
  vmToCity: FlyCityItemModel; // 切换后，真实的目的城市
  fromCity: FlyCityItemModel; // 城市切换后，真实的出发城市
  toCity: FlyCityItemModel; // 切换后，真实的目的城市
  constructor(
    private router: Router,
    private cityService: CityService,
    private dayService: SelectDateService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) {}
  goBack() {
    window.history.back();
    // this.router.navigate(["../"], { relativeTo: this.route });
  }
  onRoundTrip(single: boolean) {
    this.single = single;
  }
  getMonth(d: DayModel) {
    return +this.dayService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  ngOnInit() {
    this.onRoundTrip(true);
    this.initFlightCities();
    this.initFlightDays();
  }
  onSelectToCity(toCity: FlyCityItemModel) {
    this.toCity = toCity;
    console.log("目的城市 " + toCity.CityName);
  }
  onSelectFromCity(city: FlyCityItemModel) {
    console.log("出发城市 =>" + city.CityName);
    this.fromCity = city;
  }
  ngOnDestroy(): void {
    console.log("on destroyed");
    this.selectCitySub.unsubscribe();
    this.selectDaySub.unsubscribe();
  }
  initFlightDays() {
    this.flyDate=this.dayService.generateDayModel(moment()
    // 默认第二天
    // .add(1, "days")
    );
    this.flyDate.hasToolTip = false;
    this.flyDate.desc = "去程";
    this.flyDate.descPos = "top";
    this.backDate =this.dayService.generateDayModel( moment()
    .add(4, "days"));
    this.backDate.hasToolTip = false;
    this.backDate.desc = "返程";
    this.backDate.descPos = "bottom";
    // this.dayService.getWeekName(this.flyDate);
    // this.dayService.getWeekName(this.backDate);
    this.totalFlyDays = 4;
    this.selectDaySub = this.dayService.getSelectedDays().subscribe(days => {});
  }
  initFlightCities() {
    this.fromCity = this.vmFromCity = new FlyCityItemModel();
    this.fromCity.CityName = this.vmFromCity.CityName = "北京";
    this.vmFromCity.Code = this.fromCity.Code = "BJS";
    this.toCity = this.vmToCity = new FlyCityItemModel();
    this.toCity.CityName = this.vmToCity.CityName = "上海";
    this.vmToCity.Code = this.toCity.Code = "SHA";
    this.fromCity.Tag = this.toCity.Tag = "AirportCity"; // 出发城市，不是出发城市的那个机场
  }
  searchFlight() {
    console.log(
      `出发城市" + 【${this.fromCity && this.fromCity.CityName}】`,
      `目的城市【${this.toCity && this.toCity.CityName}】`
    );
    console.log(`启程日期${this.flyDate.date},返程日期：${this.backDate.date}`);
    const s: SearchFlightModel = new SearchFlightModel();
    s.Date = this.flyDate.date;
    s.FromCode = this.fromCity.Code;
    s.ToCode = this.toCity.Code;
    s.ToAsAirport = this.toCity.Tag === "Airport"; // 以到达 机场 查询
    s.FromAsAirport = this.fromCity.Tag === "Airport"; // 以出发 机场 查询
    s.isRoundTrip=!this.single;
    this.router.navigate([
      AppHelper.getRoutePath("flight-list"),
      {
        data: JSON.stringify(s)
      }
    ]);
  }
  getDayDesc(d: DayModel) {
    return this.dayService.getDescOfDay(d);
  }
  onSelecFlyDate(flyTo: boolean) {
    this.isSelectFlyDate = flyTo;
    if (this.single) {
      if (this.isSelectFlyDate) {
        this.dayService.setSelectedDays([this.flyDate]);
      } else {
        this.dayService.setSelectedDays([this.backDate]);
      }
    } else {
      this.dayService.setSelectedDays([this.flyDate, this.backDate]);
      this.dayService.setTitle("请选择去程日期");
    }
    this.modalCtrl.create({
        component: SelectDatetimePage,
        componentProps: {
          selectedDays: [this.flyDate, this.backDate],
          title: "请选择去程日期",
          canSelectSameDay: true,
          mutiSelect: !this.single,
          unit: "日"
        }
      })
      .then(modal => {
        if (modal) {
          modal.present();
          modal.onWillDismiss().then(res => {
            const days = res.data as DayModel[];
            if (days.length > 0) {
              if (this.single) {
                if (this.isSelectFlyDate) {
                  this.flyDate = days[0];
                } else {
                  this.backDate = days[0];
                }
              } else {
                // 往返
                this.flyDate = days[0];
                this.backDate = days[days.length - 1];
                this.totalFlyDays = days.length;
              }
            }
          });
        }
      });
  }
}
