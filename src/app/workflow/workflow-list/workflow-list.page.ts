import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { INotify, WorkflowApiService } from "./../workflow-api.service";
import { TaskEntity } from "./../models/TaskEntity";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
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
  IonInfiniteScroll
} from "@ionic/angular";

@Component({
  selector: "app-workflow-list",
  templateUrl: "./workflow-list.page.html",
  styleUrls: ["./workflow-list.page.scss"]
})
export class WorkflowListPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  private subscriptions: Subscription[] = [];
  private loadSubscription = Subscription.EMPTY;
  isLoading = false;
  tabs = [
    {
      label: "待我审批",
      value: "task"
    },
    {
      label: "抄送我的",
      value: "notify"
    },
    {
      label: "我审批的",
      value: "history"
    }
  ];
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
    private workflowApiService: WorkflowApiService
  ) {}
  onSegmentChanged(evt: CustomEvent) {
    this.tab = evt.detail.value;
    this.doRefresh();
  }
  ngOnInit() {
    this.tab = "task";
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        const t = this.tabs.find(it => it.value == this.tab);
        this.title = t && t.label;
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
    const tab = this.tab;
    if (tab == "task") {
      this.loadSubscription = this.workflowApiService
        .getTaskList(this.query)
        .pipe(
          finalize(() => {
            this.isLoading = false;
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
            this.tasks = this.tasks.concat(arr);
          }
        });
    }
    if (tab == "notify") {
      this.loadSubscription = this.workflowApiService
        .getNotifyList(this.query)
        .pipe(
          finalize(() => {
            this.isLoading = false;
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
            this.histories = this.histories.concat(arr);
          }
        });
    }
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
  }
  private refreshNotify() {
    this.notifies = [];
  }
}
