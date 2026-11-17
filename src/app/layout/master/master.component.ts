import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal, InjectionToken, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';

import { AppHeaderComponent } from '../app-header/app-header.component';

import { SessionStorageService } from '../../Shared/SessionStorageService';
import { EncryptionService } from '../../Shared/encryption.service';
import { environment } from '../../../environments/environment.development';
import { MenuItem } from '../../Models/menu-item.model';
@Component({
  selector: 'app-master',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent],
  templateUrl: './master.component.html',
  styleUrl: './master.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class MasterComponent {
  showDropdown = false;
  userdetail!: any;
  MenuAccess!: any;
  isOpen = false;
  environment = environment;
  isInvoiceUser: boolean = false;
  isSopUser: boolean = false;
  isOPSUser_Blr: boolean = false;
  isBankUser: boolean = false;
  navItems: any;
  filteredNavItems: any;


  constructor(private _encry: EncryptionService, private router: Router, private _sessionStoreage: SessionStorageService
  ) {

  }
  ngOnInit(): void {
    const json = this._sessionStoreage.getItem('UserProfile');
    if (json) {
      this.userdetail = JSON.parse(this._encry.decrypt(json));
      //console.log(this.userdetail);
    } else {
      console.warn('UserProfile not found in session storage');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    const menuAccess = this._sessionStoreage.getItem('RoleAccess');
    this.MenuAccess = menuAccess ? JSON.parse(menuAccess) : [];
    console.log('Header Menu', this.MenuAccess);

    if (this.MenuAccess.length > 0) {
      this.navItems = this.MenuAccess
        .map((menu: any) => ({
          label: menu.displayText,
          route: menu.route,
          path: menu.menuIcon
        }));

      this.filteredNavItems = [...this.navItems];
    }
  }
  isActive(route: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === route || currentUrl.startsWith(route + '/');
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200); // timeout to allow click on dropdown item
  }

  activeItem: string = 'gridOnboarding';

  setActive(item: string): void {
    this.activeItem = item;
  }

  onMenuClick(route: string): void {
    if (this.activeItem !== route) {
      this.activeItem = route;
    }
  }

  handleNavClick(item: any): void {
    if (item.label === 'Logout') {

      sessionStorage.clear(); // Or localStorage.clear() based on your auth
      this.router.navigate(['/layout/Login']);
    }
  }

  show() {
    this.isOpen = true;
  }

  Logout(): void {
    this._sessionStoreage.removeItem("UserProfile");
    this._sessionStoreage.clear();
    this.router.navigate(['/layout/Login']);
  }
}