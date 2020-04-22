import { Component, OnInit } from '@angular/core';
import { TmcDataEntity } from 'src/app/tmc/models/TmcDataEntity';
import { Router, ActivatedRoute } from '@angular/router';
import { TmcService } from 'src/app/tmc/tmc.service';

@Component({
  selector: 'app-over-hotel',
  templateUrl: './over-hotel.component.html',
  styleUrls: ['./over-hotel.component.scss'],
})
export class OverHotelComponent implements OnInit {
  tmc: TmcDataEntity;
  constructor(private router: Router, private tmcService: TmcService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(async _ => {
      this.tmc = await this.tmcService.getTmcData();
    })
  }

}
