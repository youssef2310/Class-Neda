import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPageRoutingModule } from './settings-routing.module';

import { SpareDriverPage } from './settings.page';

import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ClassesComponent } from './classes/classes.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    MaterialModule,
    TranslateModule,
  ],
  declarations: [SpareDriverPage, ClassesComponent],
})
export class SettingPageModule {}
