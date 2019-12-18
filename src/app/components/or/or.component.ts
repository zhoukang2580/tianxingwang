import { Platform } from '@ionic/angular';
import { ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-or-comp',
  templateUrl: './or.component.html',
  styleUrls: ['./or.component.scss'],
})
export class OrComponent implements OnInit, AfterViewInit {

  constructor(private el: ElementRef<HTMLElement>, private render: Renderer2, private plt: Platform) { }

  ngOnInit() { }
  ngAfterViewInit() {
    const div = this.el.nativeElement.querySelector(".size-of-fonts") as HTMLElement || document.createElement('div');
    div.style.whiteSpace = 'nowrap';
    div.style.whiteSpace = 'nowrap'
    div.style.visibility = 'hidden';
    div.classList.add("size-of-fonts");
    div.style.position = 'absolute';
    const or = this.el.nativeElement.querySelector(".or") as HTMLElement;
    let size = 16 * 0.8;
    if (or) {
      size = +(or.style.fontSize || size);
      div.style.fontSize = size + "px";
      div.style.fontFamily = or.style.fontFamily;
      requestAnimationFrame(_ => {
        div.innerText = this.el.nativeElement.innerText;
        this.el.nativeElement.appendChild(div);
      })
    }
    const leftEle: HTMLElement = this.el.nativeElement.querySelector(".left");
    const rightEle: HTMLElement = this.el.nativeElement.querySelector(".right");
    let width = 0;
    setTimeout(() => {
      if (leftEle && rightEle) {
        const innerWidth = this.plt.width();
        const clientWidth = div.clientWidth >= innerWidth * 0.5 ? innerWidth * 0.5 : div.clientWidth;
        const padding = + (getComputedStyle(or).paddingLeft.replace("px", '') + getComputedStyle(or).paddingRight.replace("px", '') || 0);
        width = Math.floor((innerWidth - padding - clientWidth) / 2);
        this.render.setStyle(leftEle, 'width', `${width}px`);
        this.render.setStyle(rightEle, 'width', `${width}px`);
      }
    }, 100);
  }
}
