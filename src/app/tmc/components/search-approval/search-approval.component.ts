import { TmcService } from "src/app/tmc/tmc.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { ModalController, IonRefresher } from "@ionic/angular";
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { ApiService } from 'src/app/services/api/api.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
export interface AppovalOption {
  Value: string;
  Text: string;
}
@Component({
  selector: "app-search-approval",
  templateUrl: "./search-approval.component.html",
  styleUrls: ["./search-approval.component.scss"]
})
export class SearchApprovalComponent implements OnInit, OnDestroy {
  private selectedApproval: AppovalOption;
  private subscription = Subscription.EMPTY;
  private reqMethod = "";
  approvals: AppovalOption[];
  loading = false;
  vmKeyword = "";
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private tmcService: TmcService
  ) { }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() { }
  doRefresh() {
    this.subscription.unsubscribe();
    this.approvals = [];
    this.vmKeyword = "";
    this.loadMore();
  }
  doSearch() {
    this.approvals = [];
    this.subscription.unsubscribe();
    this.loadMore();
  }
  private loadMore() {
    this.loading=true;
    let obs = this.searchApplyApprovals(this.vmKeyword);
    if (!this.reqMethod) {
      obs = this.tmcService.searchApprovals(this.vmKeyword);
    } 
    this.subscription = obs
    .pipe(finalize(()=>{
      setTimeout(() => {
        this.loading=false;
      }, 200);
    }))
    .subscribe(res => {
      const arr = res && res.Data;
      if (arr.length) {
        this.approvals = this.approvals.concat(arr);
      }
    })
  }
  searchApplyApprovals(
    name: string
  ) {
    const req = new RequestEntity();
    req.Method = this.reqMethod;
    req.Data = {
      name,
    };
    // req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getResponse<{ Text: string; Value: string }[]>(req)
  }
  onSelect(appoval: AppovalOption) {
    this.selectedApproval = appoval;
    this.back();
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedApproval).catch(_ => { });
    }
  }
}
