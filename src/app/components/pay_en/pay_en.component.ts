import { Component } from "@angular/core";
import { PayComponent } from '../pay/pay.component';
export interface IPayWayItem {
  label: string;
  value: string;
  isChecked?: boolean;
}
@Component({
  selector: "app-pay-comp_en",
  templateUrl: "./pay_en.component.html",
  styleUrls: ["./pay_en.component.scss"],
})
export class PayEnComponent extends PayComponent {
  
}
