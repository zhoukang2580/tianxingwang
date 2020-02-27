import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { INotify, WorkflowApiService } from "./../workflow-api.service";
import { TaskEntity } from "./../models/TaskEntity";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  OnDestroy
} from "@angular/core";
import {
  IonSegment,
  IonSegmentButton,
  IonInfiniteScroll,
  IonContent
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
interface ITab {
  label: string;
  value: string;
  img: string;
}
@Component({
  selector: "app-workflow-list",
  templateUrl: "./workflow-list.page.html",
  styleUrls: ["./workflow-list.page.scss"]
})
export class WorkflowListPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) content: IonContent;
  private subscriptions: Subscription[] = [];
  private loadSubscription = Subscription.EMPTY;
  isLoading = false;
  tabs: ITab[];
  title: string;
  tab: "task" | "history" | "notify";
  tasks: TaskEntity[];
  histories: TaskEntity[];
  notifies: INotify[];
  query: {
    name?: string;
    pageSize?: number;
    pageIndex: number;
  } = { name: "", pageIndex: 0 };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowApiService: WorkflowApiService
  ) {}
  onSegmentChanged(evt: CustomEvent) {
    this.tab = evt.detail.value;
    this.changeTitle();
    this.doRefresh();
    this.scrollToTop();
  }
  onOpenUrl(url: string, title?: string) {
    if (!url) {
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("open-url")], {
      queryParams: { title, url }
    });
  }
  private changeTitle() {
    const t = this.tabs.find(it => it.value == this.tab);
    this.title = t && t.label;
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  ngOnInit() {
    this.tabs = [
      {
        label: "待我审批",
        value: "task",
        img: "assets/svgs/wf-raise.svg"
      },
      {
        label: "抄送我的",
        value: "notify",
        img: "assets/svgs/wf-notify.svg"
      },
      {
        label: "我审批的",
        value: "history",
        img: "assets/svgs/wf-history.svg"
      }
    ];
    this.tab = "task";
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.changeTitle();
        requestAnimationFrame(() => {
          this.doRefresh();
        });
      })
    );
    this.subscriptions.push(this.loadSubscription);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  loadMore() {
    this.isLoading = this.query.pageIndex < 1;
    const tab = this.tab;
    console.log(tab);
    if (tab == "task") {
      this.loadSubscription = this.workflowApiService
        .getTaskList(this.query)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            if (this.refresher) {
              if (this.query.pageIndex <= 1) {
                this.refresher.complete();
              }
            }
          })
        )
        .subscribe(res => {
          const arr = (res && res.Data) || [];
          if (this.scroller) {
            this.scroller.disabled = arr.length < 20;
            this.scroller.complete();
          }
          if (arr.length) {
            this.query.pageIndex++;
            this.tasks = this.tasks.concat(
              arr.map(it => {
                it.ExpiredTime = this.tranformExpiredTime(it.ExpiredTime);
                return it;
              })
            );
          }
        });
    }
    if (tab == "notify") {
      this.loadSubscription = this.workflowApiService
        .getNotifyList(this.query)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            if (this.refresher) {
              if (this.query.pageIndex <= 1) {
                this.refresher.complete();
              }
            }
          })
        )
        .subscribe(res => {
          const arr = (res && res.Data) || [];
          if (this.scroller) {
            this.scroller.disabled = arr.length < 20;
            this.scroller.complete();
          }
          if (arr.length) {
            this.query.pageIndex++;
            this.notifies = this.notifies.concat(arr);
          }
        });
    }
    if (tab == "history") {
      this.loadSubscription = this.workflowApiService
        .getHistoryList(this.query)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            if (this.refresher) {
              if (this.query.pageIndex <= 1) {
                this.refresher.complete();
              }
            }
          })
        )
        .subscribe(res => {
          const arr = (res && res.Data) || [];
          if (this.scroller) {
            this.scroller.disabled = arr.length < 20;
            this.scroller.complete();
          }
          if (arr.length) {
            this.query.pageIndex++;
            this.histories = this.histories.concat(
              arr.map(it => {
                it.ExpiredTime = this.tranformExpiredTime(it.ExpiredTime);
                return it;
              })
            );
          }
        });
    }
  }
  private tranformExpiredTime(expiredTime: string) {
    return !expiredTime || expiredTime.startsWith("1800")
      ? ""
      : expiredTime.substring(0, 19);
  }
  doRefresh() {
    this.loadSubscription.unsubscribe();
    this.query.pageIndex = 0;
    this.query.name = "";
    if (this.tab == "task") {
      this.refreshTask();
    }
    if (this.tab == "history") {
      this.refreshHistory();
    }
    if (this.tab == "notify") {
      this.refreshNotify();
    }
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.loadMore();
  }
  private refreshTask() {
    this.tasks = [];
  }
  private refreshHistory() {
    this.histories = [];
    this.loadMore();
  }
  private refreshNotify() {
    this.notifies = [];
    this.loadMore();
  }
}
