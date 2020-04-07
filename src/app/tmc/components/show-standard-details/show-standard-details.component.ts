import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-standard-details',
  templateUrl: './show-standard-details.component.html',
  styleUrls: ['./show-standard-details.component.scss'],
})
export class ShowStandardDetailsComponent implements OnInit {
  title: string;
  details: string[];
  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() { 
    this.title=this.title||"我的差旅标准"
  }
  back() {
    this.popoverCtrl.dismiss();
  }
}
