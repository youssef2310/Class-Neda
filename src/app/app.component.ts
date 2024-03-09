import { Component, ViewChildren, QueryList } from '@angular/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import {
  Platform,
  NavController,
  ToastController,
  IonRouterOutlet,
  AlertController,
} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { TranslateConfigService } from './services/translate-config.service';
import { Location } from '@angular/common';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  // countryCode: any = '+20';
  phoneNo: any = '+201001630798';
  otpMsg = 'an opt wan sent';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private navCtrl: NavController,
    private toastController: ToastController,
    private translateConfig: TranslateConfigService,
    private locationAccuracy: LocationAccuracy,
    private location: Location,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    this.translateConfig.setLanguage(
      localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ar'
    );
    this.initializeApp();
    if (localStorage.getItem('verified') == '1') {
      this.router.navigate(['/tabs/home']);
    } else {
      this.router.navigate(['/signin']);
    }
    this.backButtonEvent();
  }

  checkUserExistance() {
    this.apiService
      .fetchData(localStorage.getItem('mobile'), 'neda_parents')
      .subscribe((res) => {
        console.log(res);
        if (res && res['result'].length) {
          localStorage.setItem('user', JSON.stringify(res['result'][0]));
        }
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusar.styleDefault();
      this.statusBar.backgroundColorByHexString('#083985');
      this.splashScreen.hide();
      if (localStorage.getItem('mobile')) {
        this.checkUserExistance();
      }
      this.translateConfig.setLanguage(
        localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ar'
      );
    });
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (this.router.url != '/tabs/home') {
          // await this.router.navigate(['/']);
          this.location.back();
        } else if (this.router.url === '/tabs/home') {
          if (
            new Date().getTime() - this.lastTimeBackPress >=
            this.timePeriodToExit
          ) {
            this.lastTimeBackPress = new Date().getTime();
            this.presentAlertConfirm();
          } else {
            navigator['app'].exitApp();
          }
        }
      });
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to exit the app?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Close App',
          handler: () => {
            navigator['app'].exitApp();
          },
        },
      ],
    });

    await alert.present();
  }
  async showToast() {
    const toast = await this.toastController.create({
      message: 'press back again to exit App.',
      duration: 2000,
      cssClass: 'leaveToast',
    });
    toast.present();
  }
}
