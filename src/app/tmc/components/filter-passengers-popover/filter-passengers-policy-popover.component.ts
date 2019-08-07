import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { PopoverController } from "@ionic/angular";
import { PassengerBookInfo } from '../../tmc.service';
@Component({
  selector: "app-filter-passengers-policy-popover",
  templateUrl: "./filter-passengers-policy-popover.component.html",
  styleUrls: ["./filter-passengers-policy-popover.component.scss"]
})
export class FilterPassengersPolicyComponent implements OnInit {
  @Input() bookInfos$: Observable<PassengerBookInfo[]>;
  selectedItem: PassengerBookInfo;
  constructor(private popoverCtrl: PopoverController) {}
  async onSelect(ok?: string) {
    const t = await this.popoverCtrl
      .dismiss(
        ok
          ? this.selectedItem &&
              this.selectedItem.passenger &&
              this.selectedItem.passenger.AccountId
          : null
      )
      .catch(_ => void 0);
  }
  ngOnInit() {}
}
