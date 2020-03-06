import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { finalize } from "rxjs/operators";
export interface ValidateInfo {
  name: string;
  saveType: string;
  rule: {
    Message: string; // "账户编号错误"
    Name: string; // "Account.Id"
    Rules: {
      IsRange: boolean;
      Message: string;
      Options: string;
      Pattern: string;
    }[];
  }[];
}
@Injectable({
  providedIn: "root"
})
export class ValidatorService {
  private infos: ValidateInfo[] = [];
  constructor(private apiService: ApiService) {}
  initialize(
    name: string,
    saveType: string,
    container: HTMLElement,
    isShowMessage: boolean = false
  ) {
    this.get(name, saveType)
      .then(r => {
        const validator = new window["Winner"].Validator({
          IsShowMessage: isShowMessage,
          Style: ""
        });
        validator.Initialize();
        validator.InitializeControl(r.rule, container);
      })
      .catch(_ => {
        console.error(_);
      });
  }
  get(name: string, saveType: string): Promise<ValidateInfo> {
    const info = this.infos.find(s => s.name == name && s.saveType == saveType);
    if (info) {
      return Promise.resolve(info);
    }
    return new Promise<any>((resolve, reject) => {
      const subscribtion = this.load(name, saveType)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              if (subscribtion) {
                subscribtion.unsubscribe();
              }
            }, 1000);
          })
        )
        .subscribe(
          r => {
            if (r.Status && r.Data) {
              const result = { name, saveType, rule: r.Data, validator: null };
              this.infos.push(result);
              resolve(result);
            }
            reject("");
          },
          error => {
            reject(error);
          },
          () => {}
        );
    });
  }

  private load(name: string, saveType: string) {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetValidateRule";
    req.Data = JSON.stringify({ Name: name, SaveType: saveType });
    req.IsShowLoading = true;
    return this.apiService.getResponse<any>(req);
  }
}
