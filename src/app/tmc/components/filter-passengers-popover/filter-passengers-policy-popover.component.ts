import { AppHelper } from 'src/app/appHelper';
import { StaffService } from "./../../../hr/staff.service";
import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { PopoverController } from "@ionic/angular";
import { PassengerBookInfo } from "../../tmc.service";
import { map, delay, tap } from "rxjs/operators";
@Component({
  selector: "app-filter-passengers-policy-popover",
  templateUrl: "./filter-passengers-policy-popover.component.html",
  styleUrls: ["./filter-passengers-policy-popover.component.scss"]
})
export class FilterPassengersPolicyComponent implements OnInit {
  @Input() bookInfos$: Observable<PassengerBookInfo<any>[]>;
  private bookInfos: PassengerBookInfo<any>[];
  selectedItem: PassengerBookInfo<any>;
  constructor(
    private popoverCtrl: PopoverController,
    private staffService: StaffService
  ) { }
  async onSelect(ok?: string) {
    if (this.selectedItem && this.selectedItem.id) {
      console.log("selectedItem", this.selectedItem);
    }
    const isSelf = await this.staffService.isSelfBookType();
    if (!isSelf) {
      if (!this.selectedItem && this.bookInfos && this.bookInfos.length > 1) {
        AppHelper.alert("请勾选需过滤差标的账号");
        return;
      }
    }
    if (this.selectedItem) {
      const t = await this.popoverCtrl
        .dismiss({ ...this.selectedItem })
        .catch(_ => void 0);
    }
  }
  async onMathRadioChange(evt: CustomEvent) {
    // this.selectedItem = this.selectedItem || this.bookInfos && this.bookInfos.find(it => it.isFilteredPolicy);
    if (!this.selectedItem) {
      AppHelper.alert("请勾选需过滤差标的账号");
      return;
    }
    this.selectedItem.isOnlyFilterMatchedPolicy = evt.detail && evt.detail.value == "isShowOnlyMatchSwitch" && evt.detail.checked;
  }
  onSelectItem(evt: CustomEvent) {
    if (evt.detail && evt.detail.value && evt.detail.value.passenger) {
      this.selectedItem = evt.detail.value;
      this.selectedItem.isFilteredPolicy = true;
    }
  }
  async ngOnInit() {
    const isSelf = this.staffService.isSelfBookType();
    this.bookInfos$ = this.bookInfos$.pipe(
      tap(infos => {
        this.bookInfos = infos || [];
        if (this.bookInfos.length == 1 || isSelf) {
          if (this.bookInfos.length) {
            this.selectedItem = { ...this.bookInfos[0] };
            this.selectedItem.isFilteredPolicy = true;
          }
        }
      }), delay(100))
  }
}
