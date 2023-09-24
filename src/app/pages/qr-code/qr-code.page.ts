import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';

import { NFC, Ndef } from '@ionic-native/nfc/ngx';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss'],
})
export class QrCodePage implements OnInit {
  lang: string = '';
  title = 'qrcode';
  elementType: 'url' | 'canvas' | 'img' = 'canvas';
  value = 'Techiediaries';
  ndefMsg;
  constructor(
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    public nfc: NFC,
    public ndef: Ndef
  ) {
    this.ionViewWillEnter();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.lang = this.translateService.currentLang;
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('qrCode')) return;
      this.value = paramMap.get('qrCode');
      console.log(this.value);
    });
  }

  ionViewDidEnter() {
    this.writeNFC();
  }

  writeNFC() {
    this.ndefMsg = this.ndef.textRecord('Auto Neda');
    this.nfc
      .write([this.ndefMsg])
      .then(() => {
        console.log('written');
      })
      .catch((err) => {});
  }

  goToHome() {
    this.router.navigate(['/tabs/home'], { relativeTo: this.route });
  }
}
