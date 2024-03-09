import { Component, OnInit } from '@angular/core';
import { TranslateConfigService } from 'src/app/services/translate-config.service';
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from '@ionic-native/barcode-scanner/ngx';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe, Location } from '@angular/common';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss'],
})
export class QrCodePage implements OnInit {
  lang: string = '';
  scannedData: any;
  scanSuccess: boolean = false;
  user: any;
  scanFailed: boolean = false;
  startCall: boolean;
  constructor(
    private translateConfig: TranslateConfigService,
    private barcodeScanner: BarcodeScanner,
    private apiService: ApiService,
    private datepipe: DatePipe,
    public location: Location,
    private platform: Platform
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.lang = this.translateConfig.getCurrentLang();
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getSchoolInfo();
  }

  scanStudentCode() {
    if (!this.startCall) {
      let msg = this.translateConfig.translate.instant(
        'This is not a call time'
      );
      this.apiService.sharedMethods.presentToast(msg, 'danger', 'testToast');
      return;
    }
    const options: BarcodeScannerOptions = {
      preferFrontCamera: false,
      showFlipCameraButton: false,
      showTorchButton: true,
      torchOn: false,
      prompt: 'Place a qr code inside the scan area',
      resultDisplayDuration: 500,
      formats: 'EAN_13,EAN_8,QR_CODE,PDF_417 ',
      orientation: 'portrait',
    };

    this.barcodeScanner
      .scan(options)
      .then((barcodeData) => {
        console.log('Barcode data', barcodeData);
        this.scannedData = barcodeData;
        if (this.scannedData.text && this.scannedData.text.length != 24) {
          this.scanFailed = true;
          this.scanSuccess = false;
        }
        if (this.applyCheck(this.decodeBase64(this.scannedData.text))) {
          this.saveStudentCode();
          this.scanSuccess = true;
          this.scanFailed = false;
        } else {
          this.scanFailed = true;
          this.scanSuccess = false;
          let msg = this.translateConfig.translate.instant(
            'This Code is not belong to this school'
          );
          this.apiService.sharedMethods.presentToast(
            msg,
            'danger',
            'testToast'
          );
        }
      })
      .catch((err) => {
        console.log('Error', err);
      });
  }

  decodeBase64(encodedString: string): string {
    return atob(encodedString);
  }

  saveStudentCode() {
    let data: any = {
      by: this.user['name'],
      code:
        this.user['school'] +
        this.decodeBase64(this.scannedData['text']).substring(0, 9),
      date: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
      time: this.datepipe.transform(new Date(), 'HH:mm').trim(),
      school: this.user['school'],
      reader: true,
      flag: 'call',
    };
    this.apiService.upSert(data, 'neda_call_log').subscribe((res) => {
      if (!res) return;
      let msg = this.translateConfig.translate.instant(
        'QR Code scanned and call requested successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'success', 'testToast');
    });
  }

  applyCheck(code: string): boolean {
    // Check if length(code) > 17 and charindex(',', code) = 10
    if (code.length > 17 && code.indexOf(',') === 9) {
      // Return substring based on the condition
      if (
        code !== '' &&
        code.substring(1, 4) ===
          String(this.user['school']).toUpperCase().substring(1, 4)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      // Return the original code if the condition is not met
      return false;
    }
  }

  getSchoolInfo() {
    let data = {
      code: this.user['school'],
    };
    this.apiService.fetchData(data, 'neda_schools').subscribe((res) => {
      if (!res['result']['length']) {
        return;
      } else {
        this.startCall = res['result'][0]['start_call'];
      }
    });
  }
}
