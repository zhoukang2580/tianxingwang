import { Component } from "@angular/core";
import { SearchApprovalComponent } from '../search-approval/search-approval.component';
export interface AppovalOption {
  Value: string;
  Text: string;
}
@Component({
  selector: "app-search-approval_en",
  templateUrl: "./search-approval_en.component.html",
  styleUrls: ["./search-approval_en.component.scss"],
})
export class SearchApprovalEnComponent extends SearchApprovalComponent {

}
