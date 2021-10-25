import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppHelper } from 'src/app/appHelper';
import { GuaranteeAgreementComponent } from '../guarantee-agreement/guarantee-agreement.component';

@Component({
  selector: 'app-warranty',
  templateUrl: './warranty.component.html',
  styleUrls: ['./warranty.component.scss'],
})
export class WarrantyComponent implements OnInit {
checked:boolean;
isshow:boolean;
isShowCreditCard:boolean;
title;
  constructor(private popoverCtrl:PopoverController) { }

  ngOnInit() {
    console.log(this.isShowCreditCard,"isShowCreditCard");
  }
  onHide(){
    this.isshow=false;
  }
  checkbox_click(){
    if(this.checked){
      this.checked=false;
    }else{
      this.checked=true;
    }
  }

  async onAgreement(){
    const m = await AppHelper.modalController.create({
      component: GuaranteeAgreementComponent,
      componentProps: {
      },
    });
    m.present();
  }
  onanimation(){
    this.isshow=!this.checked;
    if(this.checked){
      this.popoverCtrl.getTop().then(t=>{
        if(t){
          t.dismiss(this.checked?"checked":'unchecked');
        }
      })
    }
  }
}
