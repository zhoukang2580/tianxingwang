import { FlightComponentsModule } from './../components/components.module';
import { AppComponentsModule } from './../../components/appcomponents.module';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SelectedFlightBookInfosPage } from './selected-flight-bookinfos.page';

@NgModule({
    imports: [IonicModule, CommonModule, FlightComponentsModule, AppComponentsModule, RouterModule.forChild([{ path: "", component: SelectedFlightBookInfosPage }])],
    declarations: [SelectedFlightBookInfosPage]
})
export class SelectedFlightBookInfosPageModule {


}