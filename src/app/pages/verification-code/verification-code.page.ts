import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TranslateConfigService } from '../../services/translate-config.service';

@Component({
  selector: 'app-verification-code',
  templateUrl: './verification-code.page.html',
  styleUrls: ['./verification-code.page.scss'],
})
export class VerificationCodePage implements OnInit {
  lang: string = '';
  code: string = '';
  loading: boolean = false;
  user: any = {};
  constructor(
    private translateConfig: TranslateConfigService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.lang = this.translateConfig.getCurrentLang();
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {}

  // this called only if user entered full code
  onCodeCompleted(code: string) {
    console.log(code);
    let msg = '';
    this.code = code;
    if (this.code.length == 6) {
      if (this.code === localStorage.getItem('wtsp_code')) {
        localStorage.setItem('verified', '1');
        this.router.navigate(['/tabs/home'], {
          relativeTo: this.route,
        });
      } else if (this.code === this.user['pw']) {
        localStorage.setItem('verified', '1');
        this.router.navigate(['/tabs/home'], {
          relativeTo: this.route,
        });
      } else {
        console.log(this.code.endsWith('_'));
        if (!this.code.endsWith('_')) {
          if (this.lang == 'en') msg = 'Verification Code is incorrect';
          else msg = 'رمز التحقق غير صحيح';
          this.apiService.sharedMethods.presentToast(msg, 'danger');
        }
      }
    }
  }
  callSupport() {
    window.open('https://wa.me/966532103300', '_system');
  }
}
