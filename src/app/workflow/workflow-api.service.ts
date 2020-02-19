import { TaskEntity } from "./models/TaskEntity";
import { RequestEntity } from "./../services/api/Request.entity";
import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";

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
