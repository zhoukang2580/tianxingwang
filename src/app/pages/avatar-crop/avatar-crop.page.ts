import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as $ from "jquery";
import { AppHelper } from 'src/app/appHelper';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-avatar-crop',
  templateUrl: './avatar-crop.page.html',
  styleUrls: ['./avatar-crop.page.scss'],
})
export class AvatarCropPage implements OnInit, AfterViewInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    const croppedImage = document.getElementById('image') as HTMLImageElement;
    this.route.paramMap.subscribe(d => {
      if (d && d.get('cropAvatar')) {
        croppedImage.src = AppHelper.getRouteData();
        AppHelper.setRouteData(null);
      }
    });
  }

}
