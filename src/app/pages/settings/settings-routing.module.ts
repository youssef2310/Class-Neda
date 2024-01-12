import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpareDriverPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SpareDriverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingPageRoutingModule {}
