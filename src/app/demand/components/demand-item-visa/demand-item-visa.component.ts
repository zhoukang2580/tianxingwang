import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { SelectCountryModalComponent } from 'src/app/tmc/components/select-country/select-countrymodal.component';
import { CountryEntity } from 'src/app/tmc/models/CountryEntity';
import { DemandVisaModel } from '../../demand.service';

@Component({
  selector: 'app-demand-item-visa',
  templateUrl: './demand-item-visa.component.html',
  styleUrls: ['./demand-item-visa.component.scss'],
})
export class DemandItemVisaComponent implements OnInit {

  private requestCode:
    | "issueNationality"
    | "identityNationality"
    | "birthDate"
    | "expireDate";
  @Input() demandVisaModel:DemandVisaModel;
  @Output() demandVisa: EventEmitter<any>;
  constructor(
  ) { 
    this.demandVisa = new EventEmitter();
  }

  ngOnInit() {
    this.demandVisaModel = {} as any;
  }

  onSubmit(){
    try {
      if(this.demandVisaModel){
        if(!this.demandVisaModel.VisaType){
        AppHelper.alert("请输入签证类型");
        return;
        }
        if(!this.demandVisaModel.LiaisonName){
        AppHelper.alert("请输入联系人");
        return;
        }
        if(!this.demandVisaModel.LiaisonPhone){
        AppHelper.alert("请输入联系电话");
        return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandVisaModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandVisaModel.Email){
        AppHelper.alert("请输入邮箱");
        return;
        }
        if(!this.demandVisaModel.Destination){
        AppHelper.alert("请输入国家地区");
        return;
        }
        if(!this.demandVisaModel.WorkPlace){
        AppHelper.alert("请输入工作地");
        return;
        }
        if(!this.demandVisaModel.Remarks){
        AppHelper.alert("请输入备注");
        return;
        }
      }
    } catch (e) {
      
    }
    this.demandVisa.emit({demandVisaModel:this.demandVisaModel});
  }

  async onSelectCountry() {
    const m = await AppHelper.modalController.create({
      component: SelectCountryModalComponent,
      componentProps: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectIssueCountryTip(),
      },
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      const data = result.data as {
        requestCode: string;
        selectedItem: CountryEntity;
      };
      if (data.selectedItem) {
        this.demandVisaModel.WorkPlaceCode = data.selectedItem.Code
        this.demandVisaModel.Destination = data.selectedItem.Name;
      }
    }
  }
}
