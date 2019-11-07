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
  isOnlyMatchPolicy: boolean;
  isShowOnlyMatchSwitch = true;
  constructor(
    private popoverCtrl: PopoverController,
    private staffService: StaffService
  ) { }
  async onSelect(ok?: string) {
    if (this.selectedItem && this.selectedItem.id) {
      console.log("selectedItem", this.selectedItem, this.isOnlyMatchPolicy);
      this.selectedItem.isOnlyFilterMatchedPolicy = !!this.isOnlyMatchPolicy;
    }
    const isSelf = await this.staffService.isSelfBookType();
    if (!isSelf) {
      if (!this.selectedItem && this.bookInfos && this.bookInfos.length > 1) {
        AppHelper.alert("请选择一个人员过滤差标");
        return;
      }
    }
    if (this.selectedItem) {
      const t = await this.popoverCtrl
        .dismiss(this.selectedItem)
        .catch(_ => void 0);
    }
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
