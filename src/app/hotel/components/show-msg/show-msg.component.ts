import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-msg',
  templateUrl: './show-msg.component.html',
  styleUrls: ['./show-msg.component.scss'],
})
export class ShowMsgComponent implements OnInit {
  msg:string;
  constructor() { }

  ngOnInit() {}

}
