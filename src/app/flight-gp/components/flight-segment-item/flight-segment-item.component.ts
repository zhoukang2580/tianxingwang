import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { FlightFareType } from "../../models/flight/FlightFareType";
import { FlightCabinFareType } from "../../models/flight/FlightCabinFareType";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";

@Component({
  selector: "app-flight-segment-item",
  templateUrl: "./flight-segment-item.component.html",
  styleUrls: ["./flight-segment-item.component.scss"],
})
export class FlightSegmentItemComponent implements OnInit, OnChanges {
  isHasAgreement: boolean;
  @Input() segment: FlightSegmentEntity;
  @Input() isHasFiltered: boolean;
  @Input() isRecomendSegment: boolean;
  @Input() isShowPrice=true;
  @Input() langOpt: any = {
    has: "有",
    meal: "餐食",
    isStop: "经停",
    directFly: "直飞",
    no: "无",
    common: "共享",
    agreement: "协",
    agreementDesc: "协议价",
    planeType: "机型",
    lowestPrice: "最低价",
    lowestPriceRecommend: "最低价推荐",
  };
  constructor() {}
  ngOnChanges(s: SimpleChanges) {
    if (s && s.segment && s.segment.currentValue) {
      this.isHasAgreement =
        this.segment.Cabins &&
        this.segment.Cabins.some(
          (c) => c.FareType == FlightCabinFareType.Agreement
        );
      // if (!this.isHasAgreement) {
      //   this.langOpt.agreement = "";
      // } else {
      //   console.log("isHasAgreement", this.isHasAgreement);
      // }
    }
  }
  ngOnInit() {}

  onShowAgreement(evt: CustomEvent) {
    evt.stopPropagation();
    AppHelper.alert(
      this.langOpt.agreementDesc,
      false,
      LanguageHelper.getConfirmTip()
    );
  }
}
