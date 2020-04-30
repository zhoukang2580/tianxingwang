import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TravelFormTripEntity, TravelService } from '../../travel.service';
import { ModalController } from '@ionic/angular';
import { SelectCity } from '../select-city/select-city';

@Component({
  selector: 'app-add-stroke',
  templateUrl: './add-stroke.component.html',
  styleUrls: ['./add-stroke.component.scss'],
})
export class AddStrokeComponent implements OnInit {
  @Output() remove: EventEmitter<any>;
  @Input() trip: TravelFormTripEntity;
  @Input() index:number;
  constructor( private service: TravelService,private modalCtrl: ModalController) {
    this.remove = new EventEmitter();
  }
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  ngOnInit() { }
  onDelete() {
    this.remove.emit(this.trip);
  }
  onGetCities(){
    // return this.service.getCities();
  }
  async onSelectCity(isFrom=true){
    const m = await this.modalCtrl.create({ component: SelectCity });
    m.present();
    const res=await m.onDidDismiss();
    if(res&&res.data&&this.trip){
      if(isFrom){
        this.trip.FromCityCode=res.data.Code;
        this.trip.FromCityName=res.data.Name;
      }else{
        this.trip.ToCityCode=res.data.Code;
        this.trip.ToCityName=res.data.Name;
      }
    }
  }
}
