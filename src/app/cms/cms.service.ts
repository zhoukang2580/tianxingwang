import { Subject, BehaviorSubject } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
export interface Notice {
  Id: string;
  Title: string;
  InsertTime: string;
  Url: string;
  Detail?:string;
}
@Injectable({
  providedIn: "root"
})
export class CmsService {
  constructor(private apiService: ApiService) {
  }
  async getNotices(PageIndex: number): Promise<Notice[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Cms-Notice";
    req.Data = {
      PageIndex
    };
    return this.apiService.getPromiseData<Notice[]>(req).catch(_ => []);
  }
  async getNoticeDetail(noticeId: string): Promise<Notice> {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Cms-Detail";
    req.Data = {
      NoticeId:noticeId
    };
    return this.apiService.getPromiseData<Notice>(req);
  }
  async getAgentNotices(PageIndex: number): Promise<Notice[]> {
    const req = new RequestEntity();
    req.Data = {
      PageIndex
    };
    req.Method = "TmcApiHomeUrl-Cms-AgentNotice";
    return this.apiService.getPromiseData<Notice[]>(req).catch(_ => []);
  }
}
