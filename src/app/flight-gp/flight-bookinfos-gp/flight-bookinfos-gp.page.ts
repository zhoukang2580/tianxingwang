import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { flyInOut } from 'src/app/animations/flyInOut';
import { AppHelper } from 'src/app/appHelper';
import { RefresherComponent } from 'src/app/components/refresher/refresher.component';
import { CostCenterEntity, OrganizationEntity, StaffApprover, StaffEntity, StaffService } from 'src/app/hr/staff.service';
import { InsuranceProductEntity } from 'src/app/insurance/models/InsuranceProductEntity';
import { LanguageHelper } from 'src/app/languageHelper';
import { OrderTravelPayType, OrderTravelType } from 'src/app/order/models/OrderTravelEntity';
import { CredentialsEntity } from 'src/app/tmc/models/CredentialsEntity';
import { PassengerDto } from 'src/app/tmc/models/PassengerDto';
import { IBookOrderResult, InitialBookDtoModel, PassengerBookInfo, TmcEntity, TmcService, TravelFormEntity } from 'src/app/tmc/tmc.service';
import { TaskType } from 'src/app/workflow/models/TaskType';
import { ITmcOutNumberInfo } from '../components/flight-outnumber/flight-outnumber.component';
import { CardBinsBookInfo, IFlightSegmentInfo } from '../models/PassengerFlightInfo';
import { FlightGpService } from '../flight-gp.service';
import { OrderBookDto } from 'src/app/order/models/OrderBookDto';
import { BookGpDto } from '../models/flightgp/BookGpDto';
import { Routes } from '../models/flightgp/Routes';
import { TicketchangingComponent } from '../components/ticketchanging/ticketchanging.component';
import { IonCheckbox, PopoverController } from '@ionic/angular';
import { PassengerListEntity } from '../add-passenger-informartion-gp/add-passenger-informartion-gp.page';
import { ProductItemType } from 'src/app/tmc/models/ProductItems';
import { GpBookReq, GpPassengerDto } from 'src/app/order/models/GpBookReq';
import { OrderLinkmanDto } from '../models/flightgp/OrderLinkmanDto';

@Component({
  selector: 'app-flight-bookinfos-gp',
  templateUrl: './flight-bookinfos-gp.page.html',
  styleUrls: ['./flight-bookinfos-gp.page.scss'],
  animations: [flyInOut],
})
export class FlightBookinfosGpPage implements OnInit {
  passengerListEntity: PassengerListEntity[];
  vmCombindInfos: ICombindInfo[] = [];

  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  isShowFee = false;
  disabled = false;
  showDetail = false;
  private payResult = false;
  private isHasTask = false;
  orderTravelPayType: OrderTravelPayType;
  OrderTravelPayType = OrderTravelPayType;
  orderTravel = OrderTravelPayType;
  passengerList: {
    name: string;
    identityCard: string;
    id: string;
  }[]
  expenseTypes: string[];
  private subscriptions: Subscription[] = [];
  private totalPriceSource: Subject<number>;
  errors: any;
  passengerServiceFeesObj: { [clientId: string]: string };
  totalPrice = 0;
  isSubmitDisabled = false;
  // PayTypes = {
  //   1: "个付",
  //   2: "公付",
  //   3: "信用付",
  //   4: "实时付款"
  // }
  InsurancePrice = 0;

  checkPayCount = 5;
  checkPayCountIntervalTime = 3 * 1000;
  checkPayCountIntervalId: any;
  selectedInsuranceProductId: number;
  isRoundTrip = false;
  travelForm: TravelFormEntity;
  initialBookDtoModel: InitialBookDtoModel;
  initialBookDtoGpModel: any;
  tmc: TmcEntity;
  bookGpDto: BookGpDto[];
  DateTime: string;
  selectedFrequent: any[];
  orderLinkmanDto: OrderLinkmanDto;
  isCheckingPay: boolean;

  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private flightGpService: FlightGpService,
    private staffService: StaffService,
    private popoverController: PopoverController,
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
        this.selectedFrequent = m;
      })
    );
  }

  async ngOnInit() {
    this.route.queryParamMap.subscribe(() => {
      this.refresh(false);
    })
    this.isRoundTrip = this.flightGpService.getSearchFlightModel().isRoundTrip;
    this.flightGpService.setPassengerBookInfosSource(
      this.flightGpService.getPassengerBookInfos().filter((it) => !!it.bookInfo)
    )
    this.subscriptions.push(
      this.totalPriceSource.subscribe((p) => {
        this.totalPrice = p;
      })
    );
    try {
      await this.initSearchModelParams();
      this.orderLinkmanDto = {
        Name: "",
        Mobile: "",
        Email: "",
      }
      // this.refresh(false);
      console.log(this.passengerListEntity, 'pass');
    } catch (error) {
      console.error(error);
    }
  }

  addPassengerGp() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger-gp")])
  }

  onAddLinkman() {
    this.router.navigate([AppHelper.getRoutePath("add-passenger-informartion-gp")]);
  }

  onUpdate(evt: CustomEvent, item) {
    if (evt) {
      evt.stopPropagation();
    }
    const Id = item.passengerEntity.Id;
    console.log(Id, "id");
    // this.subscriptions.push(
    //   this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
    //     m.splice(idx, 1);
    //   })
    // );
    this.router.navigate([AppHelper.getRoutePath("update-passenger-informartion-gp")], {
      queryParams: {
        id: Id
      }
    });
  }

  onToggleIsShowFee() {
    this.isShowFee = !this.isShowFee;
  }
  async onClose(item, id, evt: CustomEvent) {
    console.log(item);
    if (evt) {
      evt.stopPropagation();
    }
    let ok = await AppHelper.alert("你要删除这段信息嘛", true, "确定", "取消");

    if (ok) {

      this.subscriptions.push(
        this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
          m.splice(id, 1);
          // this.refresh(false);
          this.getTotalPriceNumber();
          this.calcTotalPrice();
        })
      );

    }

  }

  async refresh(byUser: boolean) {
    const MOCK_FLIGHT_VMCOMBINDINFO = "mock_flight_vmcombindinfo";
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
      if (byUser) {
        const ok = await AppHelper.alert(
          "刷新将重新初始化页面，是否刷新？",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (!ok) {
          return;
        }
      }
      this.vmCombindInfos = [];
      this.initialBookDtoGpModel = await this.initializeBookDto();

      // if (this.selectedFrequent) {
      //   for (let price of this.selectedFrequent) {
      //     console.log(this.selectedFrequent, 'price');
      //     let ticketprice = this.initialBookDtoGpModel?.Routes[0]?.Fare.TicketPrice;
      //     let tax = this.initialBookDtoGpModel?.Routes[0]?.Fare.Tax;
      //     this.totalPrice = (ticketprice + tax) * this.selectedFrequent.length
      //   }
      // }
      this.getTotalPriceNumber();
      if (this.initialBookDtoGpModel) {
        this.DateTime = this.initialBookDtoGpModel.Routes[0].Segment.TakeoffTime.substring(0, 10);
        this.initialBookDtoGpModel.Routes[0].Segment.TakeoffTime = this.initialBookDtoGpModel.Routes[0].Segment.TakeoffTime.substring(11, 16);
        this.initialBookDtoGpModel.Routes[0].Segment.ArrivalTime = this.initialBookDtoGpModel.Routes[0].Segment.ArrivalTime.substring(11, 16);
        const Pordu = this.initialBookDtoGpModel.InsuranceResult.Products;
        for (let pro = 0; pro < Pordu.length; pro++) {
          Pordu[pro].showDetail = false;
        }

        console.log(this.initialBookDtoGpModel.InsuranceResult.Products, "Products");

        let cardInfo = this.initialBookDtoGpModel.CardBins;
        let cardBins = this.flightGpService.getCardBinsBookInfo();
        if (cardInfo) {

          cardBins[0] = cardInfo;
          this.flightGpService.setCardBinsBookInfoSource(cardBins);
        }
      }
      console.log(this.initialBookDtoGpModel, 'initialBookDtoModel')

      // if(this.initialBookDtoModel){
      //   this.bookGpDto = this.initialBookDtoModel.bookGpDto;
      // }

      if (!this.initialBookDtoModel) {
        this.errors = "网络错误";
      }
      this.tmc = this.initialBookDtoModel.Tmc;
      this.expenseTypes = this.initialBookDtoModel.ExpenseTypes || [];

      // await this.initCombindInfos();

      await this.initOrderTravelPayTypes();
      console.log("vmCombindInfos", this.vmCombindInfos);
    } catch (err) {
      // this.errors = err || "please retry";
      console.error(err);
    }
  }

  private async initOrderTravelPayTypes() {
    const arr1 = Object.keys(this.initialBookDtoGpModel.PayTypes);
    this.orderTravelPayTypes = [];
    arr1.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDtoGpModel.PayTypes[it],
          value: +it,
        });
      }
    });
    this.orderTravelPayType = OrderTravelPayType.Company;

    console.log(this.orderTravelPayTypes, "orderTravelPayType");
  }
  

  getInsuranceDetails(detail: string) {
    return detail && detail.split("\n").join("<br/>");
  }

  private async initializeBookDto() {
    const bookGpDto = new BookGpDto();
    const infos = this.flightGpService.getPassengerBookInfosGp();
    bookGpDto.Routes = [];
    infos.forEach((item) => {
      if (item) {
        const p = new Routes();
        p.Seg = item.Seg;
        p.Segment = item.flightSegment;
        p.Fare = item.Cabin;
        bookGpDto.Routes.push(p);
      }
    });
    console.log("initializeBookDto", bookGpDto);
    this.initialBookDtoModel = await this.flightGpService.getInitializeBookDto(
      bookGpDto
    )
    this.initialPassengerServiceFeesObj();
    return this.initialBookDtoModel;
  }
  private initialPassengerServiceFeesObj() {
    this.passengerServiceFeesObj = {};
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      Object.keys(this.initialBookDtoModel.ServiceFees).forEach((k) => {
        this.passengerServiceFeesObj[k] = this.getPassengerServiceFee(k);
      });
    }
  }

  private getPassengerServiceFee(id: string) {
    const totalFees = this.getTotalServiceFees();
    if (!totalFees) {
      return null;
    }
    const bookInfos = this.flightGpService.getPassengerBookInfos();

    const fs = bookInfos.reduce((acc, it) => {
      acc = {
        ...acc,
        [it.id]:
          this.initialBookDtoModel &&
          this.initialBookDtoModel.ServiceFees[it.id],
      };
      return acc;
    }, {});
    console.log(id, fs, "fs[id]", this.initialBookDtoModel.ServiceFees);
    return fs[id];
  }

  onShowInsuranceDetail(insurance: { showDetail: boolean }, evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
      evt.preventDefault();
    }
    if (insurance) {
      insurance.showDetail = !insurance.showDetail;
    }
  }

  // airFare() {

  // }

  calcTotalPrice() {
    console.log('order',this.orderTravelPayTypes+":"+this.orderTravelPayType);
    
    if (this.initialBookDtoGpModel) {
      let totalPrice = this.initialBookDtoGpModel.InsuranceResult.Products.filter(
        (it) =>
          it &&
          it.Id == this.selectedInsuranceProductId
      ).reduce((sum, it) => {
        sum = AppHelper.add(+it.Price, sum);
        return sum;
      }, 0);
      console.log("totalPrice ", totalPrice);
      // const fees = this.getTotalServiceFees();
      const feestotalPrice = this.getTotalPriceNumber();
      totalPrice = AppHelper.add(feestotalPrice, totalPrice * (this.selectedFrequent.length == 0 ? 1 : this.selectedFrequent.length));

      this.totalPriceSource.next(totalPrice);
    }
  }


  ngAfterViewInit() {
    if (this.checkboxes) {
      this.checkboxes.changes.subscribe(() => {
        setTimeout(() => {
          this.calcTotalPrice();
        }, 0);
        this.checkboxes.forEach((c) => {
          c.ionChange.subscribe((_) => {
            this.calcTotalPrice();
          });
        });
      });
    }
  }

  private getTotalServiceFees() {
    let fees = 0;
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      fees = Object.keys(this.initialBookDtoModel.ServiceFees).reduce(
        (acc, key) => {
          const fee = +this.initialBookDtoModel.ServiceFees[key];
          acc = AppHelper.add(fee, acc);
          return acc;
        },
        0
      );
    }
    if (!this.tmcService.isAgent) {
      if (this.tmc && !this.tmc.IsShowServiceFee) {
        if (
          this.orderTravelPayType != OrderTravelPayType.Person &&
          this.orderTravelPayType != OrderTravelPayType.Credit
        ) {
          fees = 0;
        }
      }
    }
    return fees as number;
  }

  private getTotalPriceNumber() {
    let feestotalPrice = 0
    if (this.selectedFrequent) {
      for (let price of this.selectedFrequent) {
        console.log(this.selectedFrequent, 'price');
        let ticketprice = this.initialBookDtoGpModel?.Routes[0]?.Fare.TicketPrice;
        let tax = this.initialBookDtoGpModel?.Routes[0]?.Fare.Tax;
        feestotalPrice = (ticketprice + tax) * this.selectedFrequent.length
        this.totalPrice = feestotalPrice;
      }
    }
    return feestotalPrice;
  }

  async onOpenrules(Routes: Routes) {
    console.log("cabin", Routes);
    const m = await this.popoverController.create({
      component: TicketchangingComponent,
      componentProps: { Routes: Routes },
      showBackdrop: true,
      cssClass: "ticket-changing",
      // animated: false
    });
    m.backdropDismiss = true;
    await m.present();
  }


  async onSubmit(event: CustomEvent) {
    this.isShowFee = false;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: GpBookReq = new GpBookReq();
    const arr = this.initialBookDtoGpModel;
    const canbook = await this.fillBookLinkmans();
    const canbook2 = await this.fillBookPassengers(bookDto, arr);
    // console.log(canbook);
    if (canbook && canbook2) {
      const res: IBookOrderResult = await this.flightGpService
        .bookGpFlight(bookDto)
        .catch((e) => {
          AppHelper.alert(e);
          return null;
        });
      if (res) {
        if (res.TradeNo) {
          // AppHelper.toast("下单成功!", 1400, "top");
          this.isSubmitDisabled = true;
          this.isHasTask = res.HasTasks;
          this.payResult = false;
          this.flightGpService.removeAllBookInfos();
          let checkPayResult = false;
          const isCheckPay = res.IsCheckPay;
          if (isCheckPay) {
            this.isCheckingPay = true;
            checkPayResult = await this.checkPay(res.TradeNo);
            this.isCheckingPay = false;
          } else {
            this.payResult = true;
          }
          if (checkPayResult) {
            if (this.isHasTask) {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                true
              );
            } else {
              if (isCheckPay) {
                this.payResult = await this.tmcService.payOrder(res.TradeNo);
              }
            }
          } else {
            await AppHelper.alert(
              LanguageHelper.Order.getBookTicketWaitingTip(isCheckPay),
              true
            );
          }

          this.goToMyOrders();
          // await AppHelper.alert("下单成功!");
          // this.goToMyOrders({
          //   isHasTask: this.isHasTask,
          //   payResult: this.payResult,
          //   isCheckPay:
          //     isCheckPay ||
          //     this.orderTravelPayType == OrderTravelPayType.Person ||
          //     this.orderTravelPayType == OrderTravelPayType.Credit,
          // });
        }
      }
    }
  }

  private goToMyOrders() {
    this.router.navigate(["order-list"], {
      queryParams: { tabId: ProductItemType.plane },
    });
  }


  fillBookPassengers(bookDto: GpBookReq, combindInfos: any) {
    console.log(combindInfos, 'arr');
    bookDto.PassengerDtos = [];

    const ret: GpPassengerDto = new GpPassengerDto();

    for (let fre of this.selectedFrequent) {
      ret.Pid = fre.passengerEntity.Id;
      ret.Name = fre.passengerEntity.Name;
      ret.CredentialsType = fre.passengerEntity.CredentialsTypeName;
      /// <summary>
      /// 证件号
      /// </summary>
      ret.Number = fre.passengerEntity.Number;
      /// <summary>
      /// 旅客手机号
      /// </summary>
      ret.Mobile = fre.passengerEntity.Mobile;
      /// <summary>
      /// GP公务验真标识；1：公务卡，2：预算单位
      /// </summary>
      ret.GPValidateStatus = 1;
      /// <summary>
      /// GP验真单位
      /// </summary>
      ret.GPOrganization = "";
      /// <summary>
      /// GP公务卡BIN
      /// </summary>
      ret.GPCardBin = fre.passengerEntity.Variables.BankBin;
      /// <summary>
      /// GP公务卡卡名
      /// </summary>
      ret.GPCardName = fre.passengerEntity.Variables.BankName;
    }

    const Linkman = {
      Id: this.orderLinkmanDto.Id,
      Name: this.orderLinkmanDto.Name,
      Mobile: this.orderLinkmanDto.Mobile,
      Email: this.orderLinkmanDto.Email,
      MessageLang: this.orderLinkmanDto.MessageLang
    };

    bookDto.PassengerDtos.push(ret);
    bookDto.Linkman = Linkman;
    bookDto.FlightCabin = combindInfos.Routes[0].Fare;
    bookDto.FlightSegment = combindInfos.Routes[0].Segment;
    for (let insur of combindInfos?.InsuranceResult?.Products) {
      if (insur.Id == this.selectedInsuranceProductId) {
        bookDto.Insurance = {
          ...insur
        }
      }
    }
    bookDto.PayType = this.orderTravelPayType;
    console.log(bookDto, "arr1");
    
    return true;
    // const Pordu = this.initialBookDtoGpModel.InsuranceResult.Products;
    //     for (let pro = 0; pro < Pordu.length; pro++) {
    //       Pordu[pro].showDetail = false;
    //     }
    // combindInfos = combindInfos.forEach(it=>{
    // if (this.selectedFrequent) {
    //   combindInfos.frequentEntity = this.selectedFrequent;
    // }
    // })
    // if (this.selectedFrequent) {
    //   this.combindInfos.frequentEntity = this.selectedFrequent;
    // }
    // com.Linkman = this.orderLinkmanDto;
    // for(let com of combindInfos){
    //   console.log(com);
    // }
  }

  fillBookLinkmans() {
    const isture = true;
    if (isture) {
      if (this.selectedFrequent.length == 0) {
        AppHelper.alert("乘客不能为空,请添加乘客");
        return
      }

      if (!this.selectedInsuranceProductId) {
        AppHelper.alert("必须选择一个保险信息");
        return;
      }
      const orderLinkman = {
        Name: this.orderLinkmanDto.Name,
        Mobile: this.orderLinkmanDto.Mobile,
        Email: this.orderLinkmanDto.Email
      };
      let reg = /^[\u4E00-\u9FA5]{1,8}$/;
      let reg1 = /^1[0-9]{10}$/;
      let reg2 = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[com,cn,net]{1,3})+$/

      if (!orderLinkman.Name) {
        AppHelper.alert("请输入姓名");
        return
      } else if (!reg.test(orderLinkman.Name)) {
        AppHelper.alert("请正确填写乘客姓名");
        return
      } else if (!orderLinkman.Mobile) {
        AppHelper.alert("请输入手机号")
        return
      } else if (!reg1.test(orderLinkman.Mobile)) {
        AppHelper.alert("手机号输入有误")
        return
      } else if (!orderLinkman.Email) {
        AppHelper.alert("请输入邮箱");
        return
      } else if (!reg2.test(orderLinkman.Email)) {
        AppHelper.alert("邮箱格式不正确")
        return
      }
    }

    return isture;

  }

  private async checkPay(tradeNo: string) {
    return new Promise<boolean>((s) => {
      let loading = false;
      this.checkPayCountIntervalId = setInterval(async () => {
        if (!loading) {
          loading = true;
          const result = await this.tmcService.checkPay(tradeNo, false);
          loading = false;
          this.checkPayCount--;
          if (!result) {
            if (this.checkPayCount < 0) {
              clearInterval(this.checkPayCountIntervalId);
              s(false);
            }
          } else {
            clearInterval(this.checkPayCountIntervalId);
            s(true);
          }
        }
      }, this.checkPayCountIntervalTime);
    });
  }

  // private goToMyOrders(data: {
  //   isHasTask: boolean;
  //   payResult: boolean;
  //   isCheckPay: boolean;
  // }) {
  //   try {
  //     const m = this.flightGpService.getSearchFlightModel();
  //     // const cities = await this.flightService.getStationsAsync();
  //     // const city = m.toCity;
  //     const cities = this.flightGpService.getSearchFlightModel().toCity;
  //     // const c = cities.find(it => it.Code == (city && city.Code));
  //     this.router.navigate(["checkout-success"], {
  //       queryParams: {
  //         tabId: ProductItemType.plane,
  //         cityCode: cities && cities.CityCode,
  //         cityName: cities && cities.CityName,
  //         isApproval: data.isHasTask,
  //         payResult: data.payResult,
  //         isCheckPay: data.isCheckPay,
  //         date: m.Date,
  //       },
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

}


interface ICombindInfo {
  id: string;
  vmModal: PassengerBookInfo<IFlightSegmentInfo>;
  modal: PassengerBookInfo<IFlightSegmentInfo>;
  passengerDto: PassengerDto;
  openrules: boolean; // 打开退改签规则
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
  expenseType: string;
  credentialsRequested: boolean;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  isSkipApprove: boolean;
  isShowDetail: boolean;
  isShowCredentialDetail: boolean;
  isShowTravelDetail: boolean;
  notifyLanguage: string;
  serviceFee: number;
  isShowGroupedInfo: boolean;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;
  showFriendlyReminder: boolean;
  costCenters: CostCenterEntity[];
  selectedCostCenter: CostCenterEntity;
  illegalReason: any;
  otherIllegalReason: any;
  isOtherIllegalReason: boolean;
  isOtherCostCenter: boolean;
  costCenter: {
    code: string;
    name: string;
  };
  otherCostCenterName: any;
  otherCostCenterCode: any;
  isOtherOrganization: boolean;
  organization: OrganizationEntity;
  otherOrganizationName: string;
  selectedInsuranceProductId: string;
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    disabled: boolean;
    showDetail?: boolean;
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  travelType: OrderTravelType; // 因公、因私
}
