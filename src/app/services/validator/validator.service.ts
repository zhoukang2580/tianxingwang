import { AppHelper } from "./../../appHelper";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { finalize } from "rxjs/operators";
export interface Res {
  Message: string; // "账户编号错误"
  Name: string; // "Account.Id"
  Rules?: {
    IsRange?: boolean;
    Message?: string;
    Options?: string;
    Pattern?: string;
  }[];
}
export interface ValidateInfo {
  name: string;
  saveType: string;
  rule: Res[];
}
@Injectable({
  providedIn: "root",
})
export class ValidatorService {
  private infos: ValidateInfo[] = [];
  private fetching: Promise<ValidateInfo>;
  constructor(private apiService: ApiService) {}
  checkObjPropertiy(
    obj: any,
    name: string,
    type: string,
    container: HTMLElement
  ) {
    if (!this.infos || !this.infos.length) {
      return "";
    }
    const rule = this.infos.find(
      (it) => it.name == name && it.saveType == type
    );
    if (rule && rule.rule) {
      const pro = Object.keys(obj).find((k) => !obj[k]);
      if (pro) {
        const oneEl = container.querySelector(
          `[ValidateName='${pro}']`
        ) as HTMLInputElement;
        if (oneEl) {
          const rect = oneEl.getBoundingClientRect();
          if (rect) {
            const contentEl = oneEl.closest("ion-content");
            if (contentEl) {
              contentEl.scrollByPoint(0, rect.bottom, 100);
            }
          }
        }
        const msg = rule.rule.find((r) => r.Name == pro);
        if (msg && msg.Message) {
          setTimeout(() => {
            const el = container.querySelector(
              `[ValidateName='${pro}']`
            ) as HTMLInputElement;
            if (el) {
              el.focus();
            }
          }, 120);
          return msg.Message;
        }
      }
    }
    return "";
  }
  initialize(
    name: string,
    saveType: string,
    container: HTMLElement,
    isShowMessage: boolean = false
  ) {
    return this.get(name, saveType)
      .then((r) => {
        const validator = new window["Winner"].Validator({
          IsShowMessage: isShowMessage,
          Style: "",
        });
        validator.Initialize();
        validator.InitializeControl(r.rule, container);
      })
      .catch((_) => {
        console.error(_);
      });
  }
  add(validateInfo: ValidateInfo) {
    if (!validateInfo) {
      return false;
    }
    const info = this.infos.find(
      (s) => s.name == validateInfo.name && s.saveType == validateInfo.saveType
    );
    if (info) {
      info.rule = validateInfo.rule;
      return true;
    }
    this.infos.push(validateInfo);
    return true;
  }
  get(name: string, saveType: string): Promise<ValidateInfo> {
    const info = this.infos.find(
      (s) => s.name == name && s.saveType == saveType
    );
    if (info && info.rule) {
      return Promise.resolve(info);
    }
    if (this.fetching) {
      return this.fetching;
    }
    this.fetching = this.load(name, saveType)
      .then((r) => {
        const result = { name, saveType, rule: r, validator: null };
        this.infos.push(result);
        return result;
      })
      .finally(() => {
        this.fetching = null;
      });
    return this.fetching;
  }

  private load(name: string, saveType: string) {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetValidateRule";
    req.Data = JSON.stringify({ Name: name, SaveType: saveType });
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<Res[]>(req);
  }
}
