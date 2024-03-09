import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedMethodsService } from '../../services/shared-methods.service';
import { ApiService } from '../../services/api.service';
import { TranslateConfigService } from '../../services/translate-config.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  @ViewChild('supportLinkhref') supportLinkhref: ElementRef<HTMLElement>;
  lang: string = '';
  mobile: number;
  countryPhoneCode: string = '966';
  loading: boolean = false;
  confirmationResult: any;
  verificationStatus: boolean = false;
  userName: string = '';
  constructor(
    private translateConfigService: TranslateConfigService,
    private apiService: ApiService,
    private sharedMethods: SharedMethodsService,
    private router: Router,
    private alertController: AlertController,
   
  ) {
    this.lang = this.translateConfigService.getCurrentLang();
  }

  ngOnInit() {}

  login() {
    let phone: number;
    phone = this.mobile;
    let msg: string = '';
    if (!phone || !this.countryPhoneCode) {
      if (this.lang == 'en') {
        msg = 'Please fill the required fields';
      } else {
        msg = 'يرجى ملء الحقول المطلوبة';
      }
      this.sharedMethods.presentToast(msg, 'danger', 'testToast');
      return;
    }
    if (String(phone).length < 8) {
      if (this.lang == 'en') msg = 'Mobile Number must be at least 9 digits';
      else msg = 'يجب أن يتكون رقم الجوال من ٩ ارقام';
      this.sharedMethods.presentToast(msg, 'danger', 'testToast');
      return;
    }
    phone = (this.countryPhoneCode + String(phone)) as any;
    if (!String(phone).match(/^\d+$/)) {
      if (this.lang == 'en') msg = 'Please enter the numbers in english';
      else msg = 'يرجي ادخال الارقام باللغه الانجليزيه';
      this.sharedMethods.presentToast(msg, 'danger', 'testToast');
      return;
    }
    localStorage.setItem('countryCode', this.countryPhoneCode);
    localStorage.setItem('mobile', String(this.mobile));
    localStorage.setItem('userName', this.userName);
    this.loading = true;
    this.checkUserExistance(this.mobile);
  }

  changeLanguage(lang) {
    this.translateConfigService.setLanguage(lang);
    this.lang = lang;
  }

  async contactTechSupport() {
    let msg = this.translateConfigService.translate.instant(
      'Not Registered for this service'
    );
    let contactSupport =
      this.translateConfigService.translate.instant('Contact Support');
    let close = this.translateConfigService.translate.instant('close');
    let alertMsg = this.translateConfigService.translate.instant('Alert');
    const alert = await this.alertController.create({
      header: alertMsg,
      message: msg,

      buttons: [
        {
          text: close,
          role: 'cancel',
          handler: () => {},
          cssClass: 'alert-color',
        },
        {
          text: contactSupport,
          cssClass: 'alert-color',
          role: 'confirm',
          handler: () => {
            this.supportLinkhref.nativeElement.click();
            window.open('https://wa.me/966532103300', '_blank');
            //his.router.navigateByUrl('https://wa.me/966532103300');
          },
        },
      ],
    });

    await alert.present();
  }

  checkUserExistance(mobile: any) {
    this.apiService
      .fetchData({ code: mobile }, 'neda_parents')
      .subscribe((res) => {
        this.loading = false;
        console.log(res);
        if (res && res['result'].length) {
          localStorage.setItem('user', JSON.stringify(res['result'][0]));
          this.apiService
            .sendCodeWhatsapp(this.countryPhoneCode + this.mobile)
            .subscribe((res) => {});
          let msg =
            this.translateConfigService.translate.instant('smsmcodewassent');
          this.apiService.sharedMethods.presentToast(
            msg,
            'primary',
            'testToast'
          );
          this.loading = false;
          this.router.navigate(['/verfication-code']);
        } else {
          this.contactTechSupport();
        }
      });
  }

}
