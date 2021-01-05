import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlightService, SearchFlightModel } from 'src/app/flight/flight.service';
import { HotelCityService } from 'src/app/hotel/hotel-city.service';
import { HotelService } from 'src/app/hotel/hotel.service';
import { MapService } from 'src/app/services/map/map.service';
import { CalendarService } from 'src/app/tmc/calendar.service';
import { DemandService, DemandTeamModel, FlightType } from '../../demand.service';

@Component({
  selector: 'app-demand-item-team',
  templateUrl: './demand-item-team.component.html',
  styleUrls: ['./demand-item-team.component.scss'],
})
export class DemandItemTeamComponent implements OnInit {
  searchFlightModel: SearchFlightModel;

  @Input() demandTeamModel: DemandTeamModel;
  @Output() demandTeam: EventEmitter<any>;
  constructor(
    private apiservice: DemandService,
    private calendarService: CalendarService,
    private mapService: MapService
  ) {
    this.demandTeam = new EventEmitter();
  }

  ngOnInit() {
    this.demandTeamModel = {} as any;
    this.demandTeamModel.FromCityCode = '上海';
    this.mapService.getCurMapPoint().then(c => {
      this.demandTeamModel.FromCityCode = c.cityName;
    }).catch(e => {
      console.error(e);
    })
    // this.onSubmit();
  }

  onSubmit() {
    this.demandTeam.emit({ demandTeamModel: this.demandTeamModel });
  }

  onSelectCity(isFromCity = true) {
    this.apiservice.onSelectCity(isFromCity);
  }

  async onOpenDate() {
    const r = await this.calendarService.openCalendar({
      goArrivalTime:
        '',
      isMulti: false,
      forType: null,
      beginDate: '',
      endDate: "",
    });
    if (r && r.length) {
      this.demandTeamModel.ReturnDate = r[0].date;
    }
  }

}
