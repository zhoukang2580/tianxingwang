import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DemandTourModel } from '../../demand.service';

@Component({
  selector: 'app-demand-item-meeting',
  templateUrl: './demand-item-meeting.component.html',
  styleUrls: ['./demand-item-meeting.component.scss'],
})
export class DemandItemMeetingComponent implements OnInit {
  @Input() demandTourModel: DemandTourModel;
  @Output() demandMeeting: EventEmitter<any>;
  constructor() {
    this.demandMeeting = new EventEmitter();
  }

  ngOnInit() {
    this.demandTourModel = {} as any;
  }

  onSubmit() {
    this.demandMeeting.emit({ demandTourModel: this.demandTourModel });
  }
}
