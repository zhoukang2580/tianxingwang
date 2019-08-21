import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { PopoverController } from "@ionic/angular";
import { PassengerBookInfo } from "../../tmc.service";
import { map } from "rxjs/operators";
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
  ngOnInit() {
    if (this.bookInfos$) {
      this.bookInfos$ = this.bookInfos$.pipe(
        map(infos => {
          if (infos && infos.length) {
            const arr: PassengerBookInfo[] = [];
            infos.forEach(info => {
              if (
                !arr.find(
                  it =>
                    (it.credential && it.credential.Number) ==
                      (info.credential && info.credential.Number) &&
                    (it.credential && it.credential.Type) ==
                      (info.credential && info.credential.Type)
                )
              ) {
                arr.push(info);
              }
            });
            return arr;
          }
          return infos;
        })
      );
    }
  }
}
