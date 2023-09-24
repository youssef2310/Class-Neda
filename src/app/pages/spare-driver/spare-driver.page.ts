import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SharedMethodsService } from '../../services/shared-methods.service';
import { TranslateConfigService } from '../../services/translate-config.service';

@Component({
  selector: 'app-spare-driver',
  templateUrl: './spare-driver.page.html',
  styleUrls: ['./spare-driver.page.scss'],
})
export class SpareDriverPage implements OnInit {
  lang: string = '';
  nameOne: string = '';
  mobileOne: number;
  nameTwo: string = '';
  mobileTwo: number;
  countryPhoneCode: string = '966';
  parent: any = {};
  constructor(
    private translateConfig: TranslateConfigService,
    private sharedMethods: SharedMethodsService,
    private detectChange: ChangeDetectorRef,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document
  ) {
    console.log(this.lang);
  }

  ionViewWillEnter() {
    this.lang = this.translateConfig.getCurrentLang();
    this.detectChange.detectChanges();
    // if (this.lang == 'en') document.documentElement.dir = 'ltr';
    // else document.documentElement.dir = 'rtl';
    this.parent = JSON.parse(localStorage.getItem('parent'));
    this.nameOne = this.parent.driver1N;
    this.nameTwo = this.parent.driver2N;
    if (this.parent.driver1M) this.mobileOne = Number(this.parent.driver1M);
    if (this.parent.driver2M) this.mobileTwo = Number(this.parent.driver2M);
  }

  save() {
    let phoneOne: number;
    phoneOne = this.mobileOne;
    let msg: string = '';
    let phoneTwo: number;
    phoneTwo = this.mobileTwo;

    if (this.nameOne || this.mobileOne) {
      if (!phoneOne || !this.countryPhoneCode) {
        if (this.lang == 'en') {
          msg = 'Please fill the required fields';
        } else {
          msg = 'يرجى ملء الحقول المطلوبة';
        }
        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      if (String(phoneOne).length !== 9 && this.nameOne) {
        if (this.lang == 'en') msg = 'Mobile Number must be at least 8 digits';
        else msg = 'يجب أن يتكون رقم الجوال من ٩ ارقام';

        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      phoneOne = (this.countryPhoneCode + String(phoneOne)) as any;
      // console.log(this.mobile);
      if (!String(phoneOne).match(/^\d+$/)) {
        if (this.lang == 'en') msg = 'Please enter the numbers in english';
        else msg = 'يرجي ادخال الارقام باللغه الانجليزيه';
        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      if (!this.nameOne) {
        if (this.lang == 'en') {
          msg = 'Please fill the required fields';
        } else {
          msg = 'يرجى ملء الحقول المطلوبة';
        }
        this.sharedMethods.presentToast(msg, 'danger');
      } else if (String(this.nameOne).length > 30) {
        if (this.lang == 'en')
          msg = 'Driver Name must be less than or equal 30 characters';
        else msg = 'يجب أن يكون اسم السائق أقل من أو يساوي 30 حرفًا';

        this.sharedMethods.presentToast(msg, 'danger');
        return;
      }
    }

    if (this.nameTwo || this.mobileTwo) {
      let msg: string = '';

      if (String(this.nameOne).length > 30) {
        if (this.lang == 'en')
          msg = 'Driver Name must be less than or equal 30 characters';
        else msg = 'يجب أن يكون اسم السائق أقل من أو يساوي 30 حرفًا';

        this.sharedMethods.presentToast(msg, 'danger');
        return;
      }

      if (!phoneTwo || !this.countryPhoneCode) {
        if (this.lang == 'en') {
          msg = 'Please fill the required fields';
        } else {
          msg = 'يرجى ملء الحقول المطلوبة';
        }
        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      if (String(phoneTwo).length !== 9) {
        if (this.lang == 'en') msg = 'Mobile Number must be at least 8 digits';
        else msg = 'يجب أن يتكون رقم الجوال من ٩ ارقام';

        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      phoneTwo = (this.countryPhoneCode + String(phoneTwo)) as any;
      // console.log(this.mobile);
      if (!String(phoneTwo).match(/^\d+$/)) {
        if (this.lang == 'en') msg = 'Please enter the numbers in english';
        else msg = 'يرجي ادخال الارقام باللغه الانجليزيه';
        this.sharedMethods.presentToast(msg, 'danger');

        return;
      }

      if (!this.nameTwo) {
        if (this.lang == 'en') {
          msg = 'Please fill the required fields';
        } else {
          msg = 'يرجى ملء الحقول المطلوبة';
        }
        this.sharedMethods.presentToast(msg, 'danger');
        return;
      }
    }

    this.apiService
      .saveSpareDriver(
        this.parent.code,
        this.nameOne,
        this.mobileOne,
        this.mobileTwo,
        this.nameTwo
      )
      .subscribe((res) => {
        if (this.lang == 'en') {
          msg = 'Extra Driver saved successfully';
        } else {
          msg = 'تم حفظ السائق البديل بنجاح';
        }
        this.sharedMethods.presentToast(msg, 'primary');

        return;
      });
  }

  ngOnInit() {}
}
