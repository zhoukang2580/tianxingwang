import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-time-input',
  templateUrl: './date-time-input.component.html',
  styleUrls: ['./date-time-input.component.scss'],
})
export class DateTimeInputComponent implements OnInit {
  @Input() label: string;
  @Input() validateName: string;
  @Input() dateTime: string;
  @Output() dateTimeChange: EventEmitter<string>;
  constructor() {
    this.dateTimeChange = new EventEmitter();
  }
  onTextChange() {
    this.dateTimeChange.emit(this.dateTime);
  }
  ngOnInit() { }

}
