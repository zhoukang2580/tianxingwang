import { Component, OnInit, ViewChild } from "@angular/core";
import { OrderService } from "src/app/order/order.service";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { Subscription } from "rxjs";
import { finalize, take } from "rxjs/operators";
import { IonInfiniteScroll } from "@ionic/angular";
import { StaffService } from "src/app/hr/staff.service";
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

@Component({
  selector: "app-approval-tack",
  templateUrl: "./approval-task.page.html",
  styleUrls: ["./approval-task.page.scss"],
})
export class ApprovalTaskPage implements OnInit {
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  private loadDataSub = Subscription.EMPTY;
  private pageSize = 20;
  private staffService: StaffService;
  curTaskPageIndex = 0;
  TaskStatusType = TaskStatusType;
  tasks: TaskEntity[];
  isLoading = true;
  @ViewChild(IonInfiniteScroll, { static: true })
  infiniteScroll: IonInfiniteScroll;
  loadMoreErrMsg: string;
  // public dispased: boolean = true;
  isactivename: "待我审批" | "已审任务" = "待我审批";
  Approval:string;
  activeTab: ProductItem;
  isOpenUrl = false;
  isChenkInCity: boolean = false;
  istype: number;
  ispriorApproval: boolean = true;
  iscenterApproval: boolean = true;
  constructor(
    private orderService: OrderService,
    private identityService: IdentityService,
    private router: Router
    
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doLoadMoreTasks() {
    this.loadDataSub = this.orderService
      .getOrderTasks(
        {
          PageSize: this.pageSize,
          PageIndex: this.curTaskPageIndex,
          Type:
            this.isactivename == "已审任务"
              ? 2
              : 1,
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
      url = `${url}&taskid=${task.Id}&ticket=${
        (identity && identity.Ticket) || ""
        }`;
    } else {
      url = `${url}?taskid=${task.Id}&ticket=${
        (identity && identity.Ticket) || ""
        }`;
    }
    return url;
  }

  async onTaskDetail(task: TaskEntity) {
    const url = await this.getTaskHandleUrl(task);
    if (url) {
      this.router
        .navigate(["open-url"], {
          queryParams: {
            url,
            title: task && task.Name,
            tabId: this.activeTab?.value,
            isOpenInAppBrowser: AppHelper.isApp(),
          },
        })
        .then((_) => {
          this.isOpenUrl = true;
        });
    }
  }


  onTaskApp() {
    this.curTaskPageIndex = 0;
    this.isactivename = "待我审批";
    this.infiniteScroll.disabled = true;
    this.tasks = [];
    this.doLoadMoreTasks();
  }

  onTaskReviewed() {
    this.infiniteScroll.disabled = true;
    this.curTaskPageIndex = 0;
    this.isactivename = "已审任务";
    this.tasks = [];
    this.doLoadMoreTasks();
  }
  doRefresh() {
    this.infiniteScroll.disabled = true;
    this.curTaskPageIndex = 0;
    this.tasks = [];
    this.doLoadMoreTasks();
    this.refresher.complete();
  }
}
