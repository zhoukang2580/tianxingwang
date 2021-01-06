import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DemandVisaModel } from '../../demand.service';

@Component({
  selector: 'app-demand-item-visa',
  templateUrl: './demand-item-visa.component.html',
  styleUrls: ['./demand-item-visa.component.scss'],
})
export class DemandItemVisaComponent implements OnInit {

  @Input() demandVisaModel:DemandVisaModel;
  @Output() demandVisa: EventEmitter<any>;
  constructor() { 
    this.demandVisa = new EventEmitter();
  }

  ngOnInit() {}

  onSubmit(){
    this.demandVisa.emit({demandVisaModel:this.demandVisaModel});
  }
}
