import { environment } from "./../../environments/environment";
import { TaskEntity } from "./models/TaskEntity";
import { RequestEntity } from "./../services/api/Request.entity";
import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class WorkflowApiService {
  constructor(private apiService: ApiService) {}
  getTaskList({
    pageSize,
    pageIndex,
    name
  }: {
    pageSize?: number;
    pageIndex: number;
    name?: string;
  }) {
    const req = new RequestEntity();
    req.Data = {
      Name: name,
      PageSize: pageSize || 20,
      PageIndex: pageIndex
    };
    req.Method = "WorkflowApiUrl-Task-List";
    if (!environment.production) {
      const tasks = [];
      const status = {
        0: "待审批",
        1: "已完成",
        2: "已过期"
      };
      for (let i = 0; i < 20; i++) {
        const t = new TaskEntity();
        t.Number = `${i}`;
        t.Name = `第${i}个任务`;
        t.StatusName = status[Math.random() * 3];
        tasks.push(t);
      }
      return of({ Data: tasks });
    }
    return this.apiService.getResponse<TaskEntity[]>(req);
  }
  getNotifyList({
    pageSize,
    pageIndex,
    name
  }: {
    pageSize?: number;
    pageIndex: number;
    name?: string;
  }) {
    const req = new RequestEntity();
    req.Data = {
      Name: name,
      PageSize: pageSize || 20,
      PageIndex: pageIndex
    };
    req.Method = "WorkflowApiUrl-Notify-List";
    return this.apiService.getResponse<INotify[]>(req);
  }
  getHistoryList({
    pageSize,
    pageIndex,
    name
  }: {
    pageSize?: number;
    pageIndex: number;
    name?: string;
  }) {
    const req = new RequestEntity();
    req.Data = {
      Name: name,
      PageSize: pageSize || 20,
      PageIndex: pageIndex
    };
    req.Method = "WorkflowApiUrl-History-List";
    return this.apiService.getResponse<TaskEntity[]>(req);
  }
}
export interface INotify {
  Id: string;
  Title: string;
  IsRead: string;
  Url: string;
}
