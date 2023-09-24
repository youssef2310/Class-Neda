import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TranslateConfigService } from '../../services/translate-config.service';
// import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { IonSelect, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { Payment } from '../../payment-lib/payment.model';
import { PaymentService } from '../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

// import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('operationSelect', { static: false }) selectRef: IonSelect;
  selectedOperation;
  lang: string = '';
  parentList: any[] = [];
  parentData: any;
  notifications: any[] = [];
  notifiCount: number = 0;
  paymentDate: Payment = new Payment();
  intervalTimer;
  isDeleted: boolean = false;
  parentTemp: any[] = [];
  isOffline: boolean = false;
  listPrev: any[] = [];
  homeLat: any;
  homeLng: any;
  constructor(
    private translateConfig: TranslateConfigService,
    private apiService: ApiService,
    private platform: Platform,
    private datepipe: DatePipe,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private network: Network,
    private locationAccuracy: LocationAccuracy,
    private geoLocation: Geolocation
  ) {
    let test: string = 'Student Tawfeeq is Dissmissed*لقد خرج الطالب توفيق';
    console.log(test.split('*'));
    this.lang = this.translateConfig.getCurrentLang();
    // this.ionViewWillEnter();
    this.apiService.fireParentObs.subscribe((res) => {
      this.fillParentChildren();
    });

    // if (!navigator.onLine) {
    //   this.isOffline = true;
    //   localStorage.setItem('online', '0');
    //   let msg = this.translateConfig.translate.instant(
    //     'Please Check your internet Connection and try again'
    //   );
    //   this.apiService.sharedMethods.presentToast(msg, 'primary');
    // } else {
    //   localStorage.setItem('online', '1');
    // }

    this.network.onDisconnect().subscribe((res) => {
      this.isOffline = true;
      localStorage.setItem('online', '0');
      let msg = this.translateConfig.translate.instant(
        'Please Check your internet Connection and try again'
      );
      this.apiService.sharedMethods.presentToast(msg, 'primary');
    });

    this.network.onConnect().subscribe((res) => {
      this.isOffline = false;
      localStorage.setItem('online', '1');
      let msg = this.translateConfig.translate.instant(
        'your internet connection has been restored successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'primary');
    });
  }
  activeStudent: any;
  ngOnInit() {}

  openOperationSelect(student) {
    this.activeStudent = student;
    this.selectRef.open().then((res) => {
      this.selectRef.ionChange.subscribe((res) => {
        if (this.selectedOperation == 1) {
          this.viewQrCode(student);
        } else if (this.selectedOperation == 4) {
          console.log(this.selectedOperation);
          this.setHomeLocation();
        } else if (this.selectedOperation == 5) {
          localStorage.setItem('studentCode', this.activeStudent['code']);
          this.router.navigate(['/tabs/map']);
        }
        this.selectedOperation = null;
      });
    });
  }

  fillParentChildren(observe?: boolean) {
    this.getCurrentLocation();
    if (this.isOffline || localStorage.getItem('online') == '0') {
      this.parentList = JSON.parse(localStorage.getItem('parentList'));
      this.parentData = JSON.parse(localStorage.getItem('parent'));
      return;
    }
    this.parentData = undefined;
    this.parentList = [];
    this.apiService.sharedMethods.startLoad();
    this.apiService.getParentChildren(observe).subscribe(
      (res: any) => {
        this.apiService.sharedMethods.dismissLoader();
        if (!res || !res.result) return;
        this.notifications = res['parent']['notifications'];
        if (this.notifications && this.notifications.length) {
          this.notifiCount = this.notifications.length;
          this.notifications.forEach((e, i) => {
            if (e.read == true) this.notifiCount -= 1;
          });
          localStorage.setItem('notifiCount', String(this.notifiCount));
        }

        // this.parentList.push(res?.result);
        this.parentData = res?.parent;
        localStorage.setItem('parent', JSON.stringify(this.parentData));
        // console.log(this.parentData);
        // console.log(this.parentList);
        this.parentList = [];
        Object.keys(res?.result).forEach((key) =>
          this.parentList.push(res?.result[key])
        );
        if (!this.listPrev || !this.listPrev.length)
          this.listPrev = this.parentList;
        console.log(this.parentList);
        localStorage.setItem('parentList', JSON.stringify(this.parentList));
        if (!this.parentTemp.length) this.parentTemp = this.parentList;
        //this.notifySchool();
        this.checkPaymentStatus(this.parentList);
      },
      (error) => {
        this.apiService.sharedMethods.dismissLoader();
      }
    );
  }

  getCurrentLocation() {
    // this.geoLocation.watchPosition().subscribe((res: any) => {
    //   this.homeLat = res.coords.latitude;
    //   this.homeLng = res.coords.longitude;
    // });
    this.homeLat = localStorage.getItem('currentLatitude');
    this.homeLng = localStorage.getItem('currentLongitude');
  }
  setHomeLocation() {
    this.apiService
      .setHomeLocation(this.activeStudent['code'], this.homeLat, this.homeLng)
      .subscribe((res) => {
        let msg = this.translateConfig.translate.instant(
          'Home Location Saved Successfully'
        );
        this.apiService.sharedMethods.presentToast(msg, 'primary');
      });
  }

  ionViewWillEnter() {
    this.fillParentChildren();
    this.lang = this.translateConfig.getCurrentLang();
    this.isDeleted = localStorage.getItem('accountDeleted') ? true : false;
    console.log(this.isDeleted);

    this.intervalTimer = setInterval(() => {
      if (this.isOffline || localStorage.getItem('online') == '0') {
        this.parentList = JSON.parse(localStorage.getItem('parentList'));
        this.parentData = JSON.parse(localStorage.getItem('parent'));
        return;
      }
      this.apiService.checkVerificationStatus();

      this.apiService.getParentChildren().subscribe(
        (res: any) => {
          if (!res || !res.result) return;
          this.notifications = res['parent']['notifications'];
          if (this.notifications && this.notifications.length) {
            this.notifiCount = this.notifications.length;
            this.notifications.forEach((e, i) => {
              if (e.read == true) this.notifiCount -= 1;
            });
            localStorage.setItem('notifiCount', String(this.notifiCount));

            //this.notifiCount = Number(this.notifications.length);
          }

          // this.parentList.push(res?.result);
          this.parentData = res?.parent;
          localStorage.setItem('parent', JSON.stringify(this.parentData));
          // console.log(this.parentData);
          // console.log(this.parentList);

          this.parentList = [];
          Object.keys(res?.result).forEach((key) =>
            this.parentList.push(res?.result[key])
          );

          this.parentList.forEach((element, index) => {
            element['students'].forEach((e, i) => {
              // let ij = 0
              // console.log(ij++)
              // console.log(e['lbl']);
              // console.log(this.listPrev[index]['students'][i]['lbl']);
              console.log(e['alert']);
              if (e['alert'] == true) {
                // console.log(element['school']['tone']);
                if (e['lbl']) {
                  console.log('played');
                  console.log(element['school']['tone']);
                  let audio = null;
                  audio = new Audio();
                  //audio.muted = true;
                  audio.src = '';
                  audio.src = element['school']['tone'];
                  audio.load();
                  audio.play().then((res) => {
                    audio.onended = null;
                  });

                  this.updateAlertProperty(e['code']);
                }
              }
            });
          });

          // console.log(this.parentList);
        },
        (error) => {}
      );
    }, 10000);
  }

  doRefresh(event) {
    setTimeout(() => {
      this.fillParentChildren();
      event.target.complete();
    }, 2000);
  }

  callStudent(student, school) {
    if (!student) return;

    if (
      student.call_student == 'register' ||
      (!student.paid && Number(school.school.fees) > 0)
    ) {
      this.translateConfig.translate
        .get('uhavetopaythecostoftheservice')
        .subscribe((res) => {
          this.apiService.sharedMethods.presentToast(res, 'danger');
        });
      this.getReadyToPay(student, school);
      return;
    }
    this.apiService
      .callStudent(
        student.school,
        student.parent,
        student.code,
        this.getCurrentDate(),
        false
      )
      .subscribe((res: any) => {
        if (res.status_code == 1) {
          student.call_student = 'disable';
        }
        // student.
      });
  }

  notifySchool() {
    for (let obj of this.parentList) {
      if (obj.school.start_call === true) {
        for (let student of obj.students) {
          if (student.call_student == 'enable' && student.paid == true) {
            this.getReady(student);
          }
        }
      }
    }
  }

  checkPaymentStatus(list) {
    for (let obj of list) {
      if (obj.school.fees === 0) {
        console.log('true');
        for (let student of obj.students) {
          if (student.paid == false) {
            this.setPaidProperty(student.code);
          }
        }
      }
    }
  }

  updateAlertProperty(code) {
    this.apiService.updateAlertStatus(code).subscribe((res) => {});
  }

  setPaidProperty(code) {
    this.apiService.updatePaymentStatus(code).subscribe((res) => {
      this.fillParentChildren();
    });
  }

  getReady(student) {
    this.apiService
      .callStudent(
        student.school,
        student.parent,
        student.code,
        this.getCurrentDate(),
        true
      )
      .subscribe((res: any) => {
        // student.
      });
  }

  getCurrentDate() {
    let date: Date = new Date();
    let latestDate = this.datepipe.transform(date, 'yyyy-MM-dd');
    return String(latestDate);
  }

  checkPayment(fees, paid) {
    console.log(fees, paid);
    if (paid == false && Number(fees) > 0) return false;
    else return true;
  }

  getReadyToPay(student, school) {
    localStorage.setItem('studentCode', student.code);

    console.log(school);
    let customerName = JSON.parse(localStorage.getItem('parent')).name;
    console.log(customerName);
    this.paymentDate.address = school.school.name;
    this.paymentDate.customerName = customerName;
    this.paymentDate.trackid = 'en';
    this.paymentDate.customerEmail =
      localStorage.getItem('mobile') + '@autotech.sa';
    this.paymentDate.phone = localStorage.getItem('mobile');
    this.paymentDate.amount = school.school.fees;
    console.log(this.paymentDate);
    this.paymentService
      .makePaymentService(JSON.stringify(this.paymentDate))
      .then(
        (res) => {
          console.log(res);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  viewQrCode(student) {
    console.log(student);
    if (!student || !student.qrcode) return;
    this.router.navigate(['/tabs/qr-code', { qrCode: student.qrcode }], {
      relativeTo: this.route,
    });
  }

  // checkPaymentSuccess() {
  //   this.paymentService.paymentStatusObs.subscribe((res) => {
  //     if (res == true && localStorage.getItem('studentCode')) {
  //       this.apiService
  //         .updatePaymentStatus(localStorage.getItem('studentCode'))
  //         .subscribe((res) => {
  //           this.fillParentChildren();
  //         });
  //     }
  //   });
  // }

  ionViewWillLeave() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
  }

  // onSchoolObjectChanged() {
  //   this.parentList.forEach((e, i) => {
  //     this.parentTemp.forEach((tempEle, tempIndex) => {

  //       if (tempIndex === i) {
  //         if (!_.isEqual(tempEle.school, e.school)) {
  //           console.log('notify');
  //          // this.notifySchool();
  //         }
  //       }
  //     });
  //   });
  // }
}
