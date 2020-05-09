import { TmcService } from "src/app/tmc/tmc.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import {
  ModalController,
  IonRefresher,
  IonInfiniteScroll,
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
export interface AppovalOption {
  Value: string;
  Text: string;
}
@Component({
  selector: "app-search-approval",
  templateUrl: "./search-approval.component.html",
  styleUrls: ["./search-approval.component.scss"],
})
export class SearchApprovalComponent implements OnInit, OnDestroy {
  private selectedApproval: AppovalOption;
  private subscription = Subscription.EMPTY;
  private reqMethod = "";
  private pageSize = 20;
  private pageIndex = 0;
  approvals: AppovalOption[];
  loading = false;
  vmKeyword = "";
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private tmcService: TmcService
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.doRefresh();
  }
  doRefresh() {
    this.subscription.unsubscribe();
    this.approvals = [];
    this.pageIndex = 0;
    this.vmKeyword = "";
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.loadMore();
  }
  doSearch() {
    this.pageIndex = 0;
    this.approvals = [];
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.subscription.unsubscribe();
    this.loadMore();
  }
  loadMore() {
    this.loading = this.pageIndex == 0;
    let obs = this.searchApplyApprovals(this.vmKeyword);
    if (!this.reqMethod) {
      obs = this.tmcService.searchApprovals(
        this.vmKeyword,
        this.pageIndex,
        this.pageSize
      );
    }
    this.subscription = obs
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loading = false;
            if (this.pageIndex <= 1) {
              if (this.refresher) {
                this.refresher.complete();
              }
            }
            if (this.scroller) {
              this.scroller.complete();
            }
          }, 200);
        })
      )
      .subscribe((res) => {
        const arr = (res && res.Data) || [];
        if (this.scroller) {
          this.scroller.complete();
          this.scroller.disabled = arr.length < this.pageSize;
        }
        if (arr.length) {
          this.pageIndex++;
          this.approvals = this.approvals.concat(arr);
        }
      });
  }
  searchApplyApprovals(name: string) {
    const req = new RequestEntity();
    req.Method = this.reqMethod;
    req.Data = {
      name,
      PageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };
    // req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getResponse<{ Text: string; Value: string }[]>(req);
  }
  onSelect(appoval: AppovalOption) {
    this.selectedApproval = appoval;
    this.back();
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedApproval).catch((_) => {});
    }
  }
}
