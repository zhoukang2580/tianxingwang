import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { } from 'protractor';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements OnInit {
  @Input() label: string;
  @Input() validateName: string;
  @Input() text: string;
  @Output() textChange: EventEmitter<string>;
  constructor() {
    this.textChange = new EventEmitter();
  }
  onTextChange() {
    this.textChange.emit(this.text);
  }
  ngOnInit() { }

}
