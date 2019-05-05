import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { BaseRequest } from "../services/api/BaseRequest";
import { PasswordModel } from "../flight/models/PasswordModel";

@Injectable({
  providedIn: "root"
})
export class AccountService {
  constructor(private apiService: ApiService) {}
  modifyPassword(passwordModel: PasswordModel) {
    const req = new BaseRequest();
    req.Data = JSON.stringify(passwordModel);
    req.Method=`ApiPasswordUrl-Password-Modify`;
    return this.apiService.getResponse(req);
  }
  modifyPasswordBySmsCode(){
    
  }
}
