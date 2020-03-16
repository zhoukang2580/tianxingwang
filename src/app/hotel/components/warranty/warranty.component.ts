import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-warranty',
  templateUrl: './warranty.component.html',
  styleUrls: ['./warranty.component.scss'],
})
export class WarrantyComponent implements OnInit {
checked:boolean;
isshow:boolean;
title;
  constructor(private popoverCtrl:PopoverController) { }

  ngOnInit() {
  }
  onHide(){
    this.isshow=false;
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
