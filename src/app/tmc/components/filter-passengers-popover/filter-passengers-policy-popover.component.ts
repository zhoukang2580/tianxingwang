import { AppHelper } from 'src/app/appHelper';
import { StaffService } from "./../../../hr/staff.service";
import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { PopoverController } from "@ionic/angular";
import { PassengerBookInfo } from "../../tmc.service";
import { map, delay, tap } from "rxjs/operators";
@Component({
  selector: "app-filter-passengers-policy-popover",
  templateUrl: "./filter-passengers-policy-popover.component.html",
  styleUrls: ["./filter-passengers-policy-popover.component.scss"]
})
export class FilterPassengersPolicyComponent implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @Input() bookInfos$: Observable<PassengerBookInfo<any>[]>;
  bookInfos: PassengerBookInfo<any>[];
  selectedItem: PassengerBookInfo<any>;
  get isUnFilterPolicy() {
    return this.bookInfos && this.bookInfos.every(it => !it.isFilterPolicy);
  };
  constructor(
    private popoverCtrl: PopoverController,
    private staffService: StaffService
  ) { }
  onUnFilterPolicy() {
    if (this.bookInfos) {
      this.bookInfos = this.bookInfos.map(it => {
        it.isFilterPolicy = false;
        return it;
      });
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
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
      const item = { ...this.selectedItem };
      if (this.isUnFilterPolicy) {
        item.isFilterPolicy = false;
      }
      this.subscription.unsubscribe();
      const t = await this.popoverCtrl
        .dismiss(item)
        .catch(_ => void 0);
    }
  }
  async onMathRadioChange(evt: CustomEvent) {
    // this.selectedItem = this.selectedItem || this.bookInfos && this.bookInfos.find(it => it.isFilteredPolicy);
    if (!this.selectedItem) {
      AppHelper.alert("请勾选需过滤差标的账号");
      return;
    }
    this.selectedItem.isFilterPolicy = evt.detail && evt.detail.value == "isShowOnlyMatchSwitch" && evt.detail.checked;
  }
  onSelectItem(evt: CustomEvent) {
    if (evt.detail && evt.detail.value && evt.detail.value.passenger) {
      this.selectedItem = evt.detail.value;
      this.selectedItem.isFilterPolicy = true;
    }
  }
  async ngOnInit() {
    const isSelf = this.staffService.isSelfBookType();
    this.subscription = this.bookInfos$.pipe(
      map(infos => {
        if (infos.find(it => it.isReplace)) {
          return infos.filter(it => it.isReplace)
        }
        if(isSelf){
          return [infos[0]];
        }
        return infos;
      }),
      tap(infos => {
        this.bookInfos = infos || [];
        if (this.bookInfos.length == 1 || isSelf) {
          if (this.bookInfos.length) {
            this.selectedItem = { ...this.bookInfos[0] };
          }
        }
      }), delay(10)).subscribe();
  }
}
