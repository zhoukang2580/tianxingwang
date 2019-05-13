import { Component, OnInit, Input ,EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-select-city',
  templateUrl: './select-city.page.html',
  styleUrls: ['./select-city.page.scss'],
})
export class SelectCityPage implements OnInit {
  @Input()
  title: string;
  @Input()
  displayField: string;
  @Input()
  items: any[];
  @Output()
  itemClick:EventEmitter<any>;
  constructor() {
    this.itemClick=new EventEmitter();
  }

  ngOnInit() {
    
  }
  onItemClick(item: any) {
    this.itemClick.emit(item);
  }
  onIonChange(evt: any) {
    console.log(evt);
  }
}
