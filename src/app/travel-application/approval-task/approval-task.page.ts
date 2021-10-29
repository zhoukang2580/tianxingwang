import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from "@angular/core";
import { OrderService } from "src/app/order/order.service";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { Subscription } from "rxjs";
import { finalize, take } from "rxjs/operators";
import { IonInfiniteScroll } from "@ionic/angular";
import { HrService } from "src/app/hr/hr.service";
import { RefresherComponent } from "src/app/components/refresher";
import { OrderModel } from "src/app/order/models/OrderModel";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductItem } from "src/app/tmc/models/ProductItems";
import { AppHelper } from "src/app/appHelper";
import { OrderStatusType } from "src/app/order/models/OrderEntity";
import { TaskModel } from "src/app/order/models/TaskModel";
import { TaskStatusType } from "src/app/workflow/models/TaskStatusType";
import { OpenUrlComponent } from "src/app/pages/components/open-url-comp/open-url.component";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-approval-tack",
  templateUrl: "./approval-task.page.html",
  styleUrls: ["./approval-task.page.scss"],
})
export class ApprovalTaskPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  private loadDataSub = Subscription.EMPTY;
  private queryparamSub = Subscription.EMPTY;
  private pageSize = 20;
  curTaskPageIndex = 0;
  TaskStatusType = TaskStatusType;
  tasks: TaskEntity[];
  isLoading = true;
  isApprova: boolean = true;
  isStates = true;

  @ViewChild(IonInfiniteScroll, { static: true })
  infiniteScroll: IonInfiniteScroll;
  loadMoreErrMsg: string;
  // public dispased: boolean = true;
  isactivename: "待我审批" | "已审任务" = "待我审批";
  Approval: string;
  activeTab: ProductItem;
  isChenkInCity: boolean = false;
  istype: number;
  ispriorApproval: boolean = true;
  iscenterApproval: boolean = true;
  constructor(
    private orderService: OrderService,
    private identityService: IdentityService,
    private router: Router,
    private route: ActivatedRoute,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  ngOnInit() {
    this.queryparamSub = this.route.queryParamMap.subscribe((q) => {
      const goPathQueryParams = q.get("goPathQueryParams");
      if (goPathQueryParams) {
        const p = JSON.parse(goPathQueryParams);
        if (p.tab == "已审任务") {
          // this.isactivename = '已审任务';
          this.onTaskReviewed();
        }
      }
    });
    this.doRefresh();
    AppHelper.getWindowMsgSource().subscribe((r) => {
      if (r && r.data && r.data.type == "back") {
        this.doRefresh();
      }
    });
  }
  ngOnDestroy() {
    this.loadDataSub.unsubscribe();
    this.queryparamSub.unsubscribe();
  }

  doLoadMoreTasks() {
    this.isLoading = true;
    this.loadDataSub = this.orderService
      .getOrderTasks(
        {
          PageSize: this.pageSize,
          PageIndex: this.curTaskPageIndex,
          Type: this.isactivename == "已审任务" ? 2 : 1,
        } as TaskModel,
        this.curTaskPageIndex < 1
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        })
      )
      .subscribe(
        (tasks) => {
          if (tasks) {
            if (tasks.length) {
              this.initImageStatus(tasks);
              this.tasks = this.tasks || [];
              this.tasks = this.tasks.concat(tasks);
              this.curTaskPageIndex++;
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled = tasks.length < this.pageSize;
            }
          }
        },
        (err) => {
          console.error(err);
          this.loadMoreErrMsg = err.Message || err;
        }
      );
  }

  getTaskUrl(task: TaskEntity) {
    return task && task.VariablesJsonObj["TaskUrl"];
  }

  private async getTaskHandleUrl(task: TaskEntity) {
    const identity: IdentityEntity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    let url = this.getTaskUrl(task);
    if (url?.includes("?")) {
      url = `${url}&taskid=${task.Id}&ticket=${(identity && identity.Ticket) || ""
        }&isApp=true&lang=${AppHelper.getLanguage() || ""}`;
    } else {
      url = `${url}?taskid=${task.Id}&ticket=${(identity && identity.Ticket) || ""
        }&isApp=true&lang=${AppHelper.getLanguage() || ""}`;
    }
    return url;
  }
  private initImageStatus(tasks: TaskEntity[]) {
    if (tasks) {
      tasks.forEach((task) => {
        if (task.IsOverdue) {
          task.imageStatus = "isOverdue";
        } else if (task.Status == TaskStatusType.Passed) {
          task.imageStatus = "isPassed";
        } else if (task.Status == TaskStatusType.Rejected) {
          task.imageStatus = "isRejected";
        } else if (task.Status == TaskStatusType.Closed) {
          task.imageStatus = "isClosed";
        }
      });
    }
  }
  async onTaskDetail(task: TaskEntity) {
    const url = await this.getTaskHandleUrl(task);
    if (url) {
      const m = await AppHelper.modalController.create({
        component: OpenUrlComponent,
        componentProps: {
          url,
          isOpenAsModal: true,
          isAppendTicket: true,
          isIframeOpen: true,
          isHideTitle: false,
          title: task && task.Title,
        },
      });
      m.present();
      await m.onDidDismiss();
      // this.doRefresh()
    }
  }

  onTaskApp() {
    this.curTaskPageIndex = 0;
    this.isactivename = "待我审批";
    this.infiniteScroll.disabled = true;
    this.tasks = [];
    this.loadDataSub.unsubscribe();
    this.doLoadMoreTasks();
    this.isStates = true;
  }

  onTaskReviewed() {
    this.isApprova = false;
    this.infiniteScroll.disabled = true;
    this.curTaskPageIndex = 0;
    this.isactivename = "已审任务";
    this.tasks = [];
    this.loadDataSub.unsubscribe();
    this.doLoadMoreTasks();
    this.isStates = false;
  }
  doRefresh() {
    this.infiniteScroll.disabled = true;
    this.curTaskPageIndex = 0;
    this.tasks = [];
    this.loadDataSub.unsubscribe();
    this.doLoadMoreTasks();
    this.refresher.complete();
  }
}
