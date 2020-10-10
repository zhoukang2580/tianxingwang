import { Component, Input } from "@angular/core";
import { TrainListItemComponent } from '../train-list-item/train-list-item.component';

@Component({
  selector: "app-train-list-item_en",
  templateUrl: "./train-list-item_en.component.html",
  styleUrls: ["./train-list-item_en.component.scss"]
})
export class TrainListItemEnComponent extends TrainListItemComponent {
  // @Input() langOpt: any = {
  //   about : "约",
  //   time: "时",
  //   minute: "分",
  //   isStopInfo: "经停信息",
  //   has:"有",
  //   no: "无",
  //   Left: "余票",
  //   agreement: "协",
  //   agreementDesc: "协议价",
  //   reserve:"预订"
  // }
}
