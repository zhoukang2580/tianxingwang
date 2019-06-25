import { RequestEntity } from "./../../services/api/Request.entity";
import { ApiService } from "./../../services/api/api.service";
import { LanguageHelper } from "./../../languageHelper";
import { TmcService } from "./../tmc.service";
import { HrService, StaffEntity } from "./../../hr/hr.service";
import { Component, OnInit } from "@angular/core";
import { Credentials } from "../tmc.service";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-comfirm-info",
  templateUrl: "./confirm-information.page.html",
  styleUrls: ["./confirm-information.page.scss"]
})
export class ComfirmInformationPage implements OnInit {
  credentials: Credentials[];
  staff: StaffEntity;
  password: string;
  constructor(
    private hrService: HrService,
    private apiService: ApiService,
    private tmcService: TmcService
  ) {}

  async ngOnInit() {
    this.staff = await this.hrService.getStaff();
    this.credentials = await this.tmcService.getCredentials();
    // this.credentials = [
    //   ...this.credentials,
    //   ...this.credentials,
    //   ...this.credentials
    // ];
  }
  async confirmPassword() {
    if (!this.password) {
      AppHelper.alert(LanguageHelper.getEnterPasswordTip());
      return;
    }
  }
  modifyPassword(passwordModel: {
    /// <summary>
    /// 老密码
    /// </summary>
    OldPassword: string;
    /// <summary>
    /// 新密码
    /// </summary>
    NewPassword: string;
    /// <summary>
    /// 确认密码
    /// </summary>
    SurePassword: string;
  }) {
    const req = new RequestEntity();
    req.Data = JSON.stringify(passwordModel);
    req.Method = `ApiPasswordUrl-Password-Modify`;
    return this.apiService.getPromiseResponse(req).catch(_ => false);
  }
}
