import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppHelper } from 'src/app/appHelper';
import { HrService } from 'src/app/hr/hr.service';
import { CalendarService } from 'src/app/tmc/calendar.service';
import { DayModel } from 'src/app/tmc/models/DayModel';
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
import { FlightService, SearchFlightModel } from 'src/app/flight/flight.service';
import { FlightDynamicService, SearchDynamicModule } from '../flight-dynamic.service';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { FlightCityService } from 'src/app/flight/flight-city.service';
import { ITripInfo } from 'src/app/international-flight/international-flight.service';
import { CanComponentDeactivate } from 'src/app/guards/candeactivate.guard';
import { StorageService } from 'src/app/services/storage-service.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-search-flight-dynamic',
  templateUrl: './search-flight-dynamic.page.html',
  styleUrls: ['./search-flight-dynamic.page.scss'],
})
export class SearchFlightDynamicPage implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate {
  private textChange: EventEmitter<string>;
  searchConditionSubscription = Subscription.EMPTY;
  searchDynamicModel: SearchDynamicModule
  goDate: DayModel;
  backDate: DayModel;
  isSingle = true;
  disabled = false;
  isIos = false;
  isCanleave = true;
  isleave = true;
  isSwapingCity = false;
  isShowBookInfos$ = of(0);
  fliNumber: string;
  histroyList: any[] = [];
  departureCity: string;
  arriveCity: string;

  cagAirport: any;

  airportList: any[] = [];


  private subscriptions: Subscription[] = [];
  flightno: "flightno" | "strip" = "flightno";
  isFlightNum = true;
  showReturnTrip = true;
  themeMode
  constructor(
    private flightDynamicService: FlightDynamicService,
    private calendarService: CalendarService,
    private identityService: IdentityService,
    private staffService: HrService,
    private storage: StorageService,
    private router: Router,
    private plt: Platform,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,

  ) {
    this.isIos = plt.is("ios");
    this.themeService.getModeSource().subscribe(m => {
      this.themeMode=m;
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  async ngOnInit() {
    this.searchConditionSubscription = this.flightDynamicService
      .getSearchDynamicModelSource()
      .subscribe(async (s) => {
        this.searchDynamicModel = s;
        if (s) {
          console.log(s, "s========");

          this.goDate = this.calendarService.generateDayModelByDate(s.Date);

          // this.backDate = this.calendarService.generateDayModelByDate(
          //   s.BackDate
          // );
          this.checkBackDateIsAfterflyDate();
        }
        this.showReturnTrip = await this.staffService.isSelfBookType();
      });
    this.subscriptions.push(this.searchConditionSubscription);
    this.isShowBookInfos$ = this.flightDynamicService
      .getPassengerBookInfoSource()
      .pipe(map((infos) => infos.filter((it) => !!it.bookInfo).length));


    await this.initFlightCities();
    var fromCity = this.searchDynamicModel?.fromCity?.Nickname?.replace('国际', '')?.replace('机场', '');
    var toCity = this.searchDynamicModel?.toCity?.Nickname?.replace('国际', '')?.replace('机场', '');
    this.departureCity = fromCity;
    this.arriveCity = toCity;

    this.showReturnTrip = await this.staffService
      .isSelfBookType()
      .catch((_) => false);
  }

  ngOnDestroy(): void {
    console.log("on destroyed");
    this.searchConditionSubscription.unsubscribe();
  }
  canDeactivate() {
    if (this.flightDynamicService.isShowingPage) {
      this.flightDynamicService.onSelectCity({ isShowPage: false, isFrom: false });
      return false;
    }
    return true;
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }

  private checkBackDateIsAfterflyDate() {
    if (this.goDate && this.backDate) {
      console.log(this.router.url.includes("search-dynamic"));

      this.backDate =
        this.goDate.timeStamp > this.backDate.timeStamp
          ? this.calendarService.generateDayModel(
            this.calendarService.getMoment(1, this.goDate.date)
          )
          : this.backDate;
    }
  }


  async ondelete(key) {
    if (this.histroyList) {
      this.histroyList.splice(key, 1);
    }
    if (this.airportList) {
      this.airportList.splice(key, 1);
    }
  }

  async onDelAll(key) {
    const ok = await AppHelper.alert("你确定要全部删除吗", true, "确定", "取消");
    if (ok) {
      if (this.histroyList) {
        this.histroyList.splice(0, key.length);
      }
      if (this.airportList) {
        this.airportList.splice(0, key.length);
      }
    }
  }

  onSelect(s) {
    if (s) {
      this.fliNumber = s;
    }
  }

  private async cachLastSelectedFlightGoDate(date: string) {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(
        `last_selected_flight_dynamic_goDate_${identity.Id}`,
        date
      );
    }
  }

  async onSelecDyDate(DyTo: boolean) {
    if (this.disabled) {
      return;
    }
    const dates = await this.flightDynamicService.openCalendar(
      false
    );
    if (dates && dates.length) {
      if (dates.length && this.searchDynamicModel) {
        if (DyTo) {
          this.searchDynamicModel.Date = dates[0].date;
        } else if (this.goDate) {
          this.searchDynamicModel.Date = this.goDate.date;
        }
      }
    }
    this.cachLastSelectedFlightGoDate(this.searchDynamicModel.Date);
    this.flightDynamicService.setSearchDynamicModelSource(this.searchDynamicModel);
  }


  async onSelectCity(isFromCity = true) {
    // console.log("111");
    this.isCanleave = true;
    const rs = await this.flightDynamicService.onSelectCity({
      isDomestic: true,
      isShowAirports: true,
      isFrom: isFromCity,
      isShowPage: true,
      isShowSegs: false,
      isShowHotCity: false

    });
    if (rs) {
      const s = this.searchDynamicModel;
      if (rs.isDomestic) {
        const fromCity = isFromCity ? rs.city : s.fromCity;
        const toCity = isFromCity ? s.toCity : rs.city;
        this.flightDynamicService.setSearchDynamicModelSource({
          ...s,
          fromCity,
          toCity,
          FromAirport: fromCity.Code,
          ToAirport: toCity.Code,
          FromAsAirport: s.ToAsAirport,
          ToAsAirport: s.FromAsAirport,
        });

        var fromCitys = this.searchDynamicModel?.fromCity?.Nickname?.replace('国际', '')?.replace('机场', '');
        var toCitys = this.searchDynamicModel?.toCity?.Nickname?.replace('国际', '')?.replace('机场', '');
        this.departureCity = fromCitys;
        this.arriveCity = toCitys;
      } else {
      }
    }
  }

  onSelectFromToCity(evt: CustomEvent, cites: any) {
    if (evt) {
      evt.stopPropagation();
    }
    if (cites) {
      this.flightDynamicService.onHisCity(cites);
      this.departureCity = cites.fromCity.Nickname;
      this.arriveCity = cites.toCity.Nickname;
      // var fromCity = this.searchDynamicModel?.fromCity?.Nickname;
      // var toCity = this.searchDynamicModel?.toCity?.Nickname;
      // fromCity = this.departureCity;
      // toCity = this.arriveCity;
    }
  }

  async initFlightCities() {
    const vmFromCity: TrafficlineEntity = {
      AirportCityCode: "BJS",
      CityCode: "1101",
      CityName: "北京首都",
      Code: "PEK",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Beijing",
      Id: "9183",
      Initial: "",
      IsHot: false,
      Name: "首都国际机场",
      Nickname: "北京首都",
      Pinyin: "Beijing-Capital",
      Sequence: 23,
      Tag: "Airport",
    } as TrafficlineEntity;
    const vmToCity = {
      AirportCityCode: "SHA",
      CityCode: "3101",
      CityName: "上海",
      Code: "PVG",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Shanghai",
      Id: "9184",
      Initial: "",
      IsHot: false,
      Name: "浦东国际机场",
      Nickname: "上海浦东",
      Pinyin: "Shanghai",
      Sequence: 22,
      // 出发城市，不是出发城市的那个机场
      Tag: "Airport",

    } as TrafficlineEntity;
    const lastFromCity =
      (await this.storage
        .get("fromCity_flight_dynamic")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmFromCity;
    const lastToCity =
      (await this.storage
        .get("toCity_flight_dynamic")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmToCity;
    this.flightDynamicService.setSearchDynamicModelSource({
      ...this.flightDynamicService.getSearchDynamicModel(),
      fromCity: lastFromCity,
      toCity: lastToCity,
    });
  }

  async onSwapCity() {
    if (this.disabled || this.isSwapingCity) {
      return;
    }
    this.isSwapingCity = true;
    this.flightDynamicService.onSwapsCity();
    var fromCitys = this.searchDynamicModel?.fromCity?.Nickname?.replace('国际', '')?.replace('机场', '');
    var toCitys = this.searchDynamicModel?.toCity?.Nickname?.replace('国际', '')?.replace('机场', '');
    this.departureCity = fromCitys;
    this.arriveCity = toCitys;
    setTimeout(() => {
      this.isSwapingCity = false;
    }, 240);
  }

  onFlightNumber() {
    this.flightno = 'flightno';
    this.isFlightNum = !this.isFlightNum;
  }

  onLandingZone() {
    this.flightno = 'strip';
    this.isFlightNum = !this.isFlightNum;
  }

  searchFlight(flightNo: string) {
    const s: SearchDynamicModule =
      this.searchDynamicModel || new SearchDynamicModule();
    if (flightNo == undefined || flightNo.trim() == "") {
      AppHelper.alert("请输入正确的输入条件")
      this.fliNumber = '';
      return
    }
    let reg = /^[A-Za-z\d]{2}\d{3,4}$/;
    if (!(reg.test(flightNo))) {
      AppHelper.alert("航班号不正确请输入正确的航班号")
      this.fliNumber = '';
      return
    }

    s.Date = this.goDate.date;
    this.fliNumber = this.fliNumber.toUpperCase();
    const delRepetition = this.histroyList.indexOf(this.fliNumber) == -1;
    if (delRepetition && this.fliNumber.trim().length > 0) {
      this.histroyList.unshift(this.fliNumber);
    }
    this.histroyList = this.histroyList.slice(0, 6);
    this.fliNumber = '';
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-details")], {
      queryParams: { flightNo: flightNo }
    });
  }
  async queryFlight() {
    try {
      const s: SearchDynamicModule =
        this.searchDynamicModel || new SearchDynamicModule();
      const fromCity = this.searchDynamicModel?.fromCity?.Nickname?.replace('国际', '')?.replace('机场', '');
      const toCity = this.searchDynamicModel?.toCity?.Nickname?.replace('国际', '')?.replace('机场', '');
      const fromCode = this.searchDynamicModel?.FromAirport;
      const toCode = this.searchDynamicModel?.ToAirport;
      const flightno = this.searchDynamicModel?.FlightNumber;
      console.log(fromCity + "=====" + toCity);
      this.cagAirport = this.searchDynamicModel;

      const arrList = this.airportList.filter(it => it.fromCity.Nickname == this.cagAirport.fromCity.Nickname && it.toCity.Nickname == this.cagAirport.toCity.Nickname);

      if (!arrList.length) {
        this.airportList.push(this.cagAirport);
      }

      console.log(this.airportList);

      // this.removeDuplicate(this.airportList);
      s.Date = this.goDate.date;
      s.FromAirport = fromCode;
      s.ToAirport = toCode;
      s.FlightNumber = flightno;

      console.log(s, "s=======");

      this.router.navigate([AppHelper.getRoutePath("flight-dynamic-list")]);

    } catch (error) {
      console.error(error);
    }
  }

  removeDuplicate(obj) {
    this.airportList = [];
    let stringify = {};
    for (let i = 0; i < obj.length; i++) {
      let keys = Object.keys(obj[i]);
      keys.sort((a, b) => Number(a) - Number(b));
      let str = '';
      for (var j = 0; j < keys.length; j++) {
        str += JSON.stringify(keys[j]);
        str += JSON.stringify(obj[i][keys[j]]);
      }
      if (!stringify.hasOwnProperty(str)) {
        this.airportList.push(obj[i]);
        stringify[str] = true;
      }
    }
    this.airportList = this.airportList;
    return this.airportList;
  }
}
