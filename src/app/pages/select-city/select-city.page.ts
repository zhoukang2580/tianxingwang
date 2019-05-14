import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit ,HostBinding} from '@angular/core';
import { SelectCityService } from './select-city.service';
import { trigger, transition, animate, style } from '@angular/animations';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-select-city',
  templateUrl: './select-city.page.html',
  styleUrls: ['./select-city.page.scss'],
  animations:[
    trigger('fadeout',[
      transition(":leave",animate('0.5s ease-out', style({ left: '-100%' })))
    ])
  ]
})
export class SelectCityPage implements OnInit {
  title: string;
  items: any[] = [];
  viewModelItems: any[];
  @HostBinding("@fadeout")
  fadeout;
  constructor(private router: Router, private route: ActivatedRoute,
    private http:HttpClient,
     private cityService: SelectCityService) {
    this.title = this.cityService.extra && this.cityService.extra.title;
  }

  ngOnInit() {
    
    this.items = this.cityService.getCities();
    this.viewModelItems = this.items;
    
  }
  onItemClick(item: any) {
    this.cityService.setSelectedItem(item);
    console.log(this.cityService.extra);
    this.router.setUpLocationChangeListener
    setTimeout(() => {
      window.history.back();
    }, 100);
  }
  onIonChange(evt: CustomEvent) {
    if (this.items) {
      if (evt.detail.value) {
        this.viewModelItems = this.items.filter(itm => `${itm[this.cityService.extra.displayField]}`
          .toLowerCase().includes(`${evt.detail.value}`.toLowerCase()));
      } else {
        this.viewModelItems = this.items;
      }
    }
  }
}
