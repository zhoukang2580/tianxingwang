import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @Input() label: string;
  @Input() validateName: string;
  @Input() image: string;
  @Output() imageChange: EventEmitter<string>;
  constructor() {
    this.imageChange = new EventEmitter();
  }
  onTextChange() {
    this.imageChange.emit(this.image);
  }
  ngOnInit() { }

}
