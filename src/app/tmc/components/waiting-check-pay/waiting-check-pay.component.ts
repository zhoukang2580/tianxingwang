import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-waiting-check-pay',
  templateUrl: './waiting-check-pay.component.html',
  styleUrls: ['./waiting-check-pay.component.scss'],
})
export class WaitingCheckPayComponent implements OnInit {
  @Input() isLoading = false;
  constructor() { }

  ngOnInit() { }

}
