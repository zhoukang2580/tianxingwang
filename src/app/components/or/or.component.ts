import { ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-or-comp',
  templateUrl: './or.component.html',
  styleUrls: ['./or.component.scss'],
})
export class OrComponent implements OnInit, AfterViewInit {

  constructor(private el: ElementRef<HTMLElement>, private render: Renderer2) { }

  ngOnInit() { }
  ngAfterViewInit() {
    const leftEle: HTMLElement = this.el.nativeElement.querySelector(".left");
    const rightEle: HTMLElement = this.el.nativeElement.querySelector(".right");
    const width = (this.el.nativeElement.innerText || "").length < 5 ? '35' : 0;
    if (width&&leftEle&&rightEle) {
      this.render.setStyle(leftEle, 'width', `${width}vw`);
      this.render.setStyle(rightEle, 'width', `${width}vw`);
    }
  }
}
