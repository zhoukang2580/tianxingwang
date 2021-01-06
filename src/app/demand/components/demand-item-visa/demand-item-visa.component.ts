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
