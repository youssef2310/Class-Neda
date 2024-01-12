import { Component, OnInit } from '@angular/core';
import { TranslateConfigService } from '../../services/translate-config.service';
import { ApiService } from '../../services/api.service';
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  lang: string = '';
  loading: boolean = false;
  user : any = {}
  constructor(
    private translateConfigService: TranslateConfigService,
    private apiService: ApiService,
    private platform: Platform,
    private alertController: AlertController,
    private router : Router
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.lang = this.translateConfigService.getCurrentLang();
    this.user = JSON.parse(localStorage.getItem('user'))
  }

  logOut() {
    this.loading = true;

    localStorage.clear();
    setTimeout(() => {
      this.router.navigate(['/signin'])
      this.loading = false;
    }, 1000);
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to delete your account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Confirm',
          handler: () => {
            this.logOut();
          },
        },
      ],
    });

    await alert.present();
  }

  changeLanguage(lang) {
    this.apiService.sharedMethods.dismissLoader();
    this.translateConfigService.setLanguage(lang);
    this.lang = lang;
  }

  async confirmLogout() {
    let msg = this.translateConfigService.translate.instant(
      'Do you need to Close your account and erase your data'
    );
    let confirm = this.translateConfigService.translate.instant('Yes');
    let decline = this.translateConfigService.translate.instant('No');
    let alertMsg = this.translateConfigService.translate.instant('Alert');
    const alert = await this.alertController.create({
      header: alertMsg,
      message: msg,

      buttons: [
        {
          text: decline,
          role: 'cancel',
          handler: () => {},
        },
        {
          text: confirm,
          role: 'confirm',
          handler: () => {
            this.logOut();
          },
        },
      ],
    });

    await alert.present();
  }

  closeApp() {
    navigator['app'].exitApp();
  }
}
