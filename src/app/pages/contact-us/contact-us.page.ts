import { AgentEntity } from './../../tmc/models/AgentEntity';
import { ActivatedRoute } from '@angular/router';
import { TmcService, TmcEntity } from './../../tmc/tmc.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {
  // agent: AgentEntity;
  tmc: any;
  constructor(private router: Router, private navCtrl: NavController, private tmcService: TmcService, private route: ActivatedRoute) { }
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(async _ => {
      this.tmc = await this.tmcService.getTmc(true);
    })
  }
  get date(){
    const d=new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

}
