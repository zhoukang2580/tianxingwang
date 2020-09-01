import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from 'src/app/order/order.service';
import { TaskEntity } from 'src/app/workflow/models/TaskEntity';
import { Subscription } from 'rxjs';
import { finalize, take } from "rxjs/operators";
import { IonInfiniteScroll } from '@ionic/angular';
import { StaffService } from 'src/app/hr/staff.service';
import { RefresherComponent } from 'src/app/components/refresher';
import { OrderModel } from 'src/app/order/models/OrderModel';
import { ApprovalStatusType } from '../travel.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ProductItem } from 'src/app/tmc/models/ProductItems';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-approval-tack',
  templateUrl: './approval-task.page.html',
  styleUrls: ['./approval-task.page.scss'],
})
export class ApprovalTackPage implements OnInit {
  @ViewChild(RefresherComponent, { static: true }) refresher: RefresherComponent;
  private loadDataSub = Subscription.EMPTY;
  private pageSize = 20;
  private staffService: StaffService;
  curTaskPageIndex = 0;
  tasks: TaskEntity[];
   // TravelForm =
  ApprovalStatus: ApprovalStatusType;
  isLoading = true;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  loadMoreErrMsg: string;
  public dispased: boolean = true;
  isactivename: "待我审批" | "已审任务" = '待我审批';
  activeTab: ProductItem;
  isOpenUrl = false;
  constructor(
    private orderService: OrderService,
    private identityService: IdentityService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.doLoadMoreTasks();
  }

 doLoadMoreTasks() {

    this.loadDataSub = this.orderService
      .getOrderTasks({
        PageSize: this.pageSize,
        PageIndex: this.curTaskPageIndex,
        Tag: "TravelForm"
      } as OrderModel)
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
    if (url.includes("?")) {
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

  OnTackApp() {
    this.doLoadMoreTasks();
    this.dispased = true;
    this.isactivename = "待我审批";
  }

  OnTaskReviewed() {
    this.doLoadMoreTasks();
    this.dispased = false;
    this.isactivename = "已审任务";
  }
  doRefresh() {
   this.curTaskPageIndex=0;
   this.tasks=[];
   this.doLoadMoreTasks();
   this.refresher.complete();
  }
}
