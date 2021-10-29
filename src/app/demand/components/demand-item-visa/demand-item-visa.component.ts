import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { SelectCountryModalComponent } from 'src/app/tmc/components/select-country/select-countrymodal.component';
import { CountryEntity } from 'src/app/tmc/models/CountryEntity';
import { DemandService, DemandVisaModel } from '../../demand.service';
import { DemandSearchComponent } from '../demand-search/demand-search.component';

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
  @Input() demandVisaModel: DemandVisaModel;
  @Output() demandVisa: EventEmitter<any>;
  constructor(
    private demandService: DemandService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.demandVisa = new EventEmitter();
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  ngOnInit() {
    this.demandVisaModel = {} as any;
  }

  onSubmit() {
    try {
      if (this.demandVisaModel) {
        if (!this.demandVisaModel.VisaType) {
          AppHelper.alert("请输入签证类型");
          return;
        }
        if (!this.demandVisaModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandVisaModel.LiaisonPhone) {
          AppHelper.alert("请输入联系电话");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandVisaModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (!this.demandVisaModel.Email) {
          AppHelper.alert("请输入邮箱");
          return;
        }

        const reg1 = /^\w+@[a-z0-9]+(\.[a-z]+){1,3}$/g;
        if (!(reg1.test(this.demandVisaModel.Email))) {
          AppHelper.alert("邮箱格式不正确");
          return;
        }

        if (!this.demandVisaModel.Destination) {
          AppHelper.alert("请输入国家地区");
          return;
        }
        if (!this.demandVisaModel.WorkPlace) {
          AppHelper.alert("请输入工作地");
          return;
        }
        if (!this.demandVisaModel.Remarks) {
          AppHelper.alert("请输入备注");
          return;
        }
      }
    } catch (e) {

    }
    this.demandVisa.emit({ demandVisaModel: this.demandVisaModel });
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
        this.demandVisaModel.DestinationCode = data.selectedItem.Code
        this.demandVisaModel.Destination = data.selectedItem.Name;
      }
    }
  }

  async onSelectCitys() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandVisaModel.WorkPlace = `${c.Name}`;
      this.demandVisaModel.WorkPlaceCode = `${c.Code}`;
    }
  }
}
