import { Component, OnInit, Input } from '@angular/core';

interface IConditionItem {
  label: string;
  isChecked?: boolean;
}
@Component({
  selector: 'app-direct-fly',
  templateUrl: './direct-fly.component.html',
  styleUrls: ['./direct-fly.component.scss'],
})
export class DirectFlyComponent implements OnInit {
  items: IConditionItem[];
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
  }

}
