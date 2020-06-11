import { interval } from 'rxjs';
import { Subscription } from 'rxjs';
import { DomController } from '@ionic/angular';
import { AfterViewInit } from "@angular/core";
import { Renderer2 } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { OnDestroy, Output } from "@angular/core";
import { ElementRef } from "@angular/core";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import echarts from "echarts";
@Component({
  selector: "app-echart",
  templateUrl: "./echart.component.html",
  styleUrls: ["./echart.component.scss"]
})
export class EchartComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: any;
  private subscription = Subscription.EMPTY;
  @Input() option: any;
  @Output() optionChange: EventEmitter<any>;
  @Input() isLoading = true;
  constructor(private el: ElementRef<HTMLElement>, private domCtrl: DomController) {
    this.optionChange = new EventEmitter();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.chart) {
      this.chart.dispose()
    }
  }
  ngOnInit() {
    this.initChart();
  }
  ngAfterViewInit() {
    this.shoLoading();
    requestAnimationFrame(() => {
      this.resize();
    });
  }
  private shoLoading() {
    if (this.chart) {
      this.chart.showLoading();
    }
  }
  private hideLoading() {
    if (this.chart) {
      this.chart.hideLoading();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.option && changes.option.currentValue) {
      this.clear();
      this.update();
      if (!changes.option.firstChange) {
        this.shoLoading();
        this.resize();
      }
    }
    if (changes && changes.isLoading) {
      if (changes.isLoading.currentValue) {
        this.shoLoading();
      } else {
        this.hideLoading();
      }
    }
  }
  private clear() {
    if (this.chart) {
      this.chart.clear();
    }
  }
  private update() {
    if (!this.chart) {
      this.initChart();
    }
    if (this.chart) {
      this.shoLoading();
      this.chart.setOption(this.option);
      requestAnimationFrame(() => {
        this.hideLoading();
      });
    }
  }
  private resize(tryCount = 10) {
    this.domCtrl.read(() => {
      const elrect = this.el.nativeElement.getBoundingClientRect();
      const prect = this.el.nativeElement.parentElement.getBoundingClientRect()
      const rect = { width: Math.max(elrect.width, prect.width), height: Math.max(elrect.height, prect.height) }
      if (!rect.width || !rect.height || ~~rect.width != ~~prect.width || ~~rect.height != ~~prect.height) {
        this.subscription.unsubscribe();
        this.subscription = interval(1000).subscribe(() => {
          if (tryCount > 0) {
            this.resize(--tryCount);
          } else {
            this.hideLoading();
          }
        })
      } else {
        this.subscription.unsubscribe();
        this.chart.resize({
          width: `${rect.width}px`,
          height: `${rect.height}px`
        })
        this.hideLoading();
      }
    })
  }
  private initChart() {
    if (!this.chart) {
      this.chart = echarts.init(this.el.nativeElement);
    }
  }
}
