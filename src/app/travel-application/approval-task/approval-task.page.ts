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
  ApprovalStatusType: ApprovalStatusType;
  isLoading = true;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  loadMoreErrMsg: string;
  public dispased: boolean = true;
  isactivename: "待我审批" | "已审任务" = '待我审批';
  constructor(private orderService: OrderService) { }

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

  OnTackApp() {
    this.dispased = true;
    this.isactivename = "待我审批";
  }

  OnTaskReviewed() {
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
