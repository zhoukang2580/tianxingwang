import { StaffService } from "./../../../hr/staff.service";
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
  @Input() bookInfos$: Observable<PassengerBookInfo<any>[]>;
  selectedItem: PassengerBookInfo<any>;
  isOnlyMatchPolicy: boolean;
  constructor(
    private popoverCtrl: PopoverController,
    private staffService: StaffService
  ) {}
  async onSelect(ok?: string) {
    if (this.selectedItem && this.selectedItem.id) {
      console.log("selectedItem", this.selectedItem, this.isOnlyMatchPolicy);
      this.selectedItem.isOnlyFilterMatchedPolicy = !!this.isOnlyMatchPolicy;
    }
    const t = await this.popoverCtrl
      .dismiss(ok ? this.selectedItem : null)
      .catch(_ => void 0);
  }
  onSelectItem(evt: CustomEvent) {
    if (evt.detail && evt.detail.value && evt.detail.value.passenger) {
      this.selectedItem = evt.detail.value;
    }
  }
  async ngOnInit() {
    if (this.bookInfos$ && (await this.staffService.isSelfBookType())) {
      this.bookInfos$ = this.bookInfos$.pipe(
        map(infos => {
          if (infos && infos.length) {
            const arr: PassengerBookInfo<any>[] = [];
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
