import { Component, OnInit } from '@angular/core';
interface IConditionItem {
  label: string;
  isChecked?: boolean;
}

@Component({
  selector: 'app-air-company',
  templateUrl: './air-company.component.html',
  styleUrls: ['./air-company.component.scss'],
})
export class AirCompanyComponent implements OnInit {
  items: IConditionItem[];
  unlimited:boolean;
  constructor() { }

  ngOnInit() {
  
    this.items = [
      {
        label: "东方航空"
      },
      {
        label: "四川航空"
      },
      {
        label: "吉祥航空"
      },
      {
        label: "春秋航空"
      },
    ]
      this.onReset();
  }
  onReset(){
    if(this.items){
      this.items=this.items.map(it=>{
        it.isChecked=false
        return it;
      })
      this.unlimited=true;
    }
  }
  onChangeChecked(){
    if(this.items){
      this.unlimited= this.items.every(e=>!e.isChecked);
    }
  }

}
