import { OrderEntity } from 'src/app/order/models/OrderEntity';
import { CalendarService } from './../../../tmc/calendar.service';
import { StaffEntity } from './../../../hr/staff.service';
import { TrainEntity } from './../../models/TrainEntity';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-train-ticket',
  templateUrl: './train-ticket.component.html',
  styleUrls: ['./train-ticket.component.scss'],
})
export class TrainTicketComponent implements OnInit {
  @Input() train: TrainEntity;
  @Input() order:OrderEntity;
  @Input() passenger: StaffEntity;

  constructor(private calendarService: CalendarService) { }
  getDate(date: string) {
    if (date) {
      const wns = this.calendarService.getDayOfWeekNames();
      const d = new Date(date);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const wn = wns[d.getDay()];
      return `${d.getFullYear()}年${m < 10 ? "0" : ""}${m}月${day < 10 ? "0" : ""}${day} ${wn}`;
    }
  }
  getHHmm(time:string){
    return this.calendarService.getHHmm(time);
  }
  ngOnInit() { }

}
