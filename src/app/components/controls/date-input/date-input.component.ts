import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
})
export class DateInputComponent implements OnInit {
  @Input() label: string;
  @Input() validateName: string;
  @Input() date: string;
  @Output() dateChange: EventEmitter<string>;
  constructor() {
    this.dateChange = new EventEmitter();
  }
  onTextChange() {
    this.dateChange.emit(this.date);
  }
  ngOnInit() { }

}
