import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { TmcEntity, TmcService } from "../tmc/tmc.service";
import { RequestEntity } from "../services/api/Request.entity";
import { IdentityEntity } from "../services/identity/identity.entity";
import { IdentityService } from "../services/identity/identity.service";
import { OrderModel } from "../order/models/OrderModel";

@Injectable({
  providedIn: "root",
})
export class AgentService {
  tmc: TmcEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private tmcService: TmcService
  ) {}
  async onSelect(item: TmcEntity) {
    let res = false;
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-SelectTmc";
    req.Data = {
      TmcId: item.Id,
    };
    req.IsShowLoading = true;
    const result = await this.apiService
      .getPromiseData<IdentityEntity>(req)
      .catch((e) => {
        console.log(e);
        return null;
      });
    if (result && result.Numbers && result.Numbers.TmcId) {
      const identityEntity = await this.identityService.getIdentityAsync();
      this.identityService.setIdentity({
        ...identityEntity,
        ...result,
      });
      res = true;
      this.tmc = await this.tmcService.getTmc(true);
    }
    return res;
  }
  queryTmc(name: string, pageIndex: number) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-QueryTmc";
    req.Data = {
      Name: name,
      PageIndex: pageIndex,
    };
    return this.apiService.getResponse<TmcEntity[]>(req);
  }
}
