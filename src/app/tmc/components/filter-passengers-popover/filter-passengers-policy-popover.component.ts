import { AppHelper } from 'src/app/appHelper';
import { StaffService } from "./../../../hr/staff.service";
import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { PopoverController } from "@ionic/angular";
import { PassengerBookInfo } from "../../tmc.service";
import { map, tap } from "rxjs/operators";
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
        .dismiss(this.selectedItem)
        .catch(_ => void 0);
    }
  }
  onMathRadioChange(evt: CustomEvent) {
    if (evt.detail && evt.detail.value) {
      this.selectedItem.isAllowBookPolicy = evt.detail && evt.detail.value == "isAllowBookPolicy";
      this.selectedItem.isOnlyFilterMatchedPolicy = evt.detail && evt.detail.value == "isShowOnlyMatchSwitch";
    }
  }
  onSelectItem(evt: CustomEvent) {
    if (evt.detail && evt.detail.value && evt.detail.value.passenger) {
      this.selectedItem = evt.detail.value;
      if (this.bookInfos) {
        this.bookInfos.forEach(it => {
          it.isFilteredPolicy = it.id == this.selectedItem.id;
          it.isAllowBookPolicy = it.id == this.selectedItem.id;
        })
      }
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
                info.isFilteredPolicy = true;
                arr.push(info);
              }
            });
            return arr;
          }
          return infos;
        })
      );
    }
    this.bookInfos$ = this.bookInfos$.pipe(
      map(infos => {
        if (infos.length == 1) {
          return infos.map(info => {
            info.isFilteredPolicy = true;
            return info;
          })
        }
        return infos;
      }),
      tap(infos => {
        this.bookInfos = infos;
      }))
  }
}
