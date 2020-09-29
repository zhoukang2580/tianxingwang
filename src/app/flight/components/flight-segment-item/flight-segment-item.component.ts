import { LanguageHelper } from 'src/app/languageHelper';
import { AppHelper } from './../../../appHelper';
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { Component, OnInit, Input } from "@angular/core";
import { FlightFareType } from '../../models/flight/FlightFareType';

@Component({
  selector: "app-flight-segment-item",
  templateUrl: "./flight-segment-item.component.html",
  styleUrls: ["./flight-segment-item.component.scss"],
})
export class FlightSegmentItemComponent implements OnInit {
  FlightFareType = FlightFareType;
  @Input() segment: FlightSegmentEntity;
  @Input() isHasFiltered: boolean;
  @Input() isRecomendSegment: boolean;
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

  ngOnInit() {}
  
  onShowAgreement(evt:CustomEvent){
    evt.stopPropagation();
    AppHelper.alert(this.langOpt.agreementDesc,false,LanguageHelper.getConfirmTip());
  }
}
