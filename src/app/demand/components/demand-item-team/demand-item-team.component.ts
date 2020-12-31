import { Component, OnInit } from '@angular/core';
import { DemandService } from '../../demand.service';

@Component({
  selector: 'app-demand-item-team',
  templateUrl: './demand-item-team.component.html',
  styleUrls: ['./demand-item-team.component.scss'],
})
export class DemandItemTeamComponent implements OnInit {
  teams: {
    Tag: string,
    DemandType: string
  }

  constructor(
    private apiservice: DemandService
  ) { }

  ngOnInit() {
    this.teams = {
      Tag: '',
      DemandType: ''
    }
    this.demandTeam();
  }

  private async demandTeam() {
    this.apiservice.getDemandTeam(this.teams);
  }

}
