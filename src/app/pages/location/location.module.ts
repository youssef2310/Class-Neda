import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationPageRoutingModule } from './location-routing.module';

import { LocationPage } from './location.page';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationPageRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDJX9QlWUokfa9TQcz2ZDMFZ9RypFDHDLs',
    }),
    AgmDirectionModule,
    TranslateModule,
    MaterialModule,
    RouterModule,
  ],
  declarations: [LocationPage],
})
export class LocationPageModule {}
