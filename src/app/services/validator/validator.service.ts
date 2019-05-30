
import { BaseRequest } from "../api/BaseRequest";
import { Injectable } from "@angular/core";
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: "root"
})
export class ValidatorService {
  private infos: {name:string,saveType:string,rule:any,validator:any}[]= [];
  constructor(private apiService: ApiService) {
   
  }
  initialize(name:string,saveType:string,container:HTMLElement,isShowMessage:boolean=false)
  {
    this.get(name,saveType).then(r=>{
      if(!r.validator)
      {
        r.validator=new window["Winner"].Validator({IsShowMessage:isShowMessage,Style:""});
        r.validator.Initialize();
        r.validator.InitializeControl(r.rule, container);
      }
    });
  }
  get(name:string,saveType:string)
  {
    var info=this.infos.find(s=>s.name==name && s.saveType==saveType);
    if(info)
    {
      return Promise.resolve(info);
    }
    return new Promise<any>((resolve, reject) => {
      const subscribtion = this.load(name,saveType).subscribe(
        r => {
          if(r.Status && r.Data)
          {
            const info={name,saveType,rule:r.Data,validator:null};
            this.infos.push(info);
            resolve(info);
          }
          reject("");
        },
        error => {
          reject(error);
        },
        () => {
          setTimeout(() => {
            if (subscribtion) {
              subscribtion.unsubscribe();
            }
          }, 0);
        }
      );
    }).catch(() => null);
  }

  load(name:string,saveType:string) {

    const req = new BaseRequest();
    req.Method = "ApiHomeUrl-Home-GetValidateRule";
    req.Data = JSON.stringify({ Name: name,SaveType:saveType });
    return this.apiService
      .getResponse<any>(req)
  }
}
