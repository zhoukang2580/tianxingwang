import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-warm-prompt',
  templateUrl: './warm-prompt.component.html',
  styleUrls: ['./warm-prompt.component.scss'],
})
export class WarmPromptComponent implements OnInit {

  explains:string;
  // constructor(private popoverCtrl: PopoverController) {}
  async cancel() {
    const m = await this.popoverCtrl.getTop();
    m.dismiss();
  }
  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  async onGoIt(){
    const m = await this.popoverCtrl.getTop();
    m.dismiss();
  }

}
