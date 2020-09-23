import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { ApiService } from "../services/api/api.service";
import { RequestEntity } from "../services/api/Request.entity";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  constructor(private apiService: ApiService) {}
  getItems(data: { LastTime: string; LastId: string; Date: string }) {
    const req = new RequestEntity();
    req.Method = "";
    req.Data = data;
    return this.apiService.getResponse<{
      LastId: string;
      LastTime: string;
      Datas: any[];
    }>(req);
  }
}
