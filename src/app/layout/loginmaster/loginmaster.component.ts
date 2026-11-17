import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, InjectionToken, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastNoAnimation, ToastrService } from 'ngx-toastr';
import { IAuthServiceService } from '../../Repository/iauth-service.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { NgOptimizedImage } from '@angular/common'
import { EncryptionService } from '../../Shared/encryption.service';
import { SessionStorageService } from '../../Shared/SessionStorageService';
import { TokenService } from '../../Shared/TokenService';
import { HttpClient } from '@angular/common/http';

const auth = InjectionToken<IAuthServiceService>;
@Component({
  selector: 'app-loginmaster',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './loginmaster.component.html',
  styleUrl: './loginmaster.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: auth,
      useClass: AuthServiceService,
    }
  ]
})
export class LoginmasterComponent {
  username: string = ''
  password: string = ''
  isPasswordVisible = false;
  isSubmitting: boolean = false;
  Name: string = '';
  userDeviceData!: string;
  ipAddress: string = '::1';
  computername: string = '';
  validationErrors: Array<any> = [];
  isLoading = false;
  showCountryPopup: boolean = false;
  countries: string[] = [];
  selectedUser: any = null;
  loginPayload: any = null;

  constructor(
    @Inject(auth) private _authService: IAuthServiceService,
    private toastr: ToastrService,
    private router: Router,
    private _encry: EncryptionService,
    private sessionStorageService: SessionStorageService,
    private tokenservice: TokenService,
    private http: HttpClient
  ) {

  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  ngOnInit(): void {
    // localStorage.clear();
    //sessionStorage.clear();
    if (!this.router.navigated) {
      location.reload(); // Only if you need hard reload
    }

    // $.ajax({
    //   url: 'http://localhost:7000',
    //   type: 'GET',
    //   cache: false,
    //   success: (response) => {
    //     this.computername = response;
    //     console.log("Computer Name:", response);
    //   },
    //   error: (xhr, status, error) => {
    //     console.error('Error fetching data:', error);
    //   }
    // });


  }

  getIpAddress(): void {
    this.http.get('https://api.ipify.org?format=json').subscribe({
      next: (res: any) => {
        this.ipAddress = res.ip;
      },
      error: (err) => {
        console.error('Error fetching IP:', err);
      }
    });
  }
  
  validateLogin(): void {
    if (!this.username || this.username.trim() === '') {
      this.toastr.error("Please Enter Employee Code", "Error");
      return;
    }

    if (!this.password || this.password.trim() === '') {
      this.toastr.error("Please Enter Password", "Error");
      return;
    }

    const login = {
      username: this.username,
      password: this.password,
      ipAddress: this.ipAddress,
      Cname: this.computername,
    };

    this.isLoading = true;

    this._authService.ValidateLogin(login).subscribe({
      next: (loginStatus) => {
        this.isLoading = false;
        this.loginPayload = loginStatus.Data;
        if (this.loginPayload && this.loginPayload[0].error_Message === "" && this.loginPayload[0].user_Id > 0) {
          if (this.loginPayload && this.loginPayload.length > 1) {
            const countrySchemas: string[] = this.loginPayload.map(
              (x: any) => x.countryName
            );
            console.log('countrySchemas', countrySchemas);
            this.openCountryPopup(countrySchemas);
          }
          else {
            this.selectedUser = this.loginPayload[0];
            this.userrole();
          }
        } else {
          this.toastr.error(this.loginPayload[0].error_Message || "Invalid credentials", "Error");
          this.router.navigate(['/Login']);
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.toastr.error(err.message, "Error");
      }
    });
  }

  RolewiseAccess(user_Id: number, countrySchema: string): void {
    const payload = { user_Id, countrySchema };
    this._authService.RoleWiseAccess(payload).subscribe({
      next: res => {
        const result = res.Data;
        this.sessionStorageService.setItem('RoleAccess', JSON.stringify(result));
        if (result) {
          const menuAccess = result;
          console.log('loginmenu', menuAccess);
          let navigateTo = '';
          for (const menu of menuAccess) {
            if (menu.children && menu.children.length > 0) {
              navigateTo = menu.children[0].childroute;
              break;
            }
            if (menu.route) {
              navigateTo = menu.route;
              break;
            }
          }

          if (navigateTo) {
            this.router.navigate([navigateTo]);
          } else {
            // Optional fallback
            alert("Menu Mapping not found for user!");
            this.router.navigate(['/layout/Login']);
          }
        }
      },
      error: err => {
        console.error(`Login error: `, err.message);
      }
    });
  }

  openCountryPopup(countryList: string[]) {
    this.countries = countryList;
    this.showCountryPopup = true;
  }

  selectCountry(country: string) {

    const selectedUser = this.loginPayload.find(
      (user: any) => user.countryName === country
    );

    if (selectedUser) {
      this.selectedUser = selectedUser;
      this.userrole();
      this.showCountryPopup = false;
    }
  }

  userrole(){
      this.Name = this.selectedUser.userName;
      this.sessionStorageService.setItem('UserProfile', this._encry.encrypt(JSON.stringify(this.selectedUser)));
      this.tokenservice.setTokens(
        this._encry.encrypt(this.selectedUser.token),
        this._encry.encrypt(this.selectedUser.refreshtoken)
      );
      this.RolewiseAccess(this.selectedUser.user_Id, this.selectedUser.countrySchema);
  }

  closePopup() {
    this.showCountryPopup = false;
  }

}
