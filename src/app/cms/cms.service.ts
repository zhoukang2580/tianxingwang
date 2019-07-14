import { Subject, BehaviorSubject } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Injectable } from "@angular/core";
export interface Notice {
  Id: string;
  Title: string;
  InsertTime: string;
  Url: string;
}
@Injectable({
  providedIn: "root"
})
export class CmsService {
  private selectedNoticeSource: Subject<Notice>;
  constructor(private apiService: ApiService) {
    this.selectedNoticeSource = new BehaviorSubject(null);
  }
  async getNotices(PageIndex: number): Promise<Notice[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Cms-Notice";
    req.Data = {
      PageIndex
    };
    return this.apiService.getResponseAsync<Notice[]>(req).catch(_ => []);
  }
  async getAgentNotices(PageIndex: number): Promise<Notice[]> {
    const req = new RequestEntity();
    req.Data = {
      PageIndex
    };
    req.Method = "TmcApiHomeUrl-Cms-AgentNotice";
    return this.apiService.getResponseAsync<Notice[]>(req).catch(_ => []);
  }
  getSelectedNotice() {
    return this.selectedNoticeSource.asObservable();
  }
  setSelectedNotice(n: Notice) {
    this.selectedNoticeSource.next(n);
  }
}
