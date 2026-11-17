import { CommonModule } from '@angular/common';
import { Component, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { EncryptionService } from '../../../Shared/encryption.service';
import { SessionStorageService } from '../../../Shared/SessionStorageService';

@Component({
  selector: 'app-customernavigation',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterModule],
  templateUrl: './customernavigation.component.html',
  styleUrl: './customernavigation.component.css'
})
export class CustomernavigationComponent {
  
  environment = environment;
  menuAccess: any[] = [];
  childMenus: any[] = [];
  activeItem: string = '';
  userdetail: any;
  iconpath: any;

  setActive(item: string): void {
    this.activeItem = item;
  }

  currentRoute: string = '';
  get tabRoutes(): string[] {
    return this.childMenus.map(x => x.childroute);
  }

  constructor(private router: Router
    , public _sessionStoreage: SessionStorageService
    , public decry: EncryptionService) { }

  ngOnChanges(changes: SimpleChanges): void {

  }
  async ngOnInit() {
    const json = this._sessionStoreage.getItem('UserProfile');
    if (json) {
      this.userdetail = JSON.parse(this.decry.decrypt(json));
    } else {
      console.warn('UserProfile not found in session storage');
    }
    const menuJson = this._sessionStoreage.getItem('RoleAccess');
    if (menuJson) {
      this.menuAccess = JSON.parse(menuJson);
      const parent = this.menuAccess.find(x => x.menuName === 'customer');
      if (parent) {
        this.childMenus = parent.children;
        this.iconpath = parent.menuIcon;
      }
    }

    this.currentRoute = this.router.url;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }
}
