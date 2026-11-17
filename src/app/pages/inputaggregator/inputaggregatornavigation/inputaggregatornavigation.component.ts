import { CommonModule } from '@angular/common';
import { Component, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { EncryptionService } from '../../../Shared/encryption.service';
import { SessionStorageService } from '../../../Shared/SessionStorageService';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-inputaggregatornavigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './inputaggregatornavigation.component.html',
  styleUrl: './inputaggregatornavigation.component.css'
})
export class InputaggregatornavigationComponent {

  
  environment = environment;
  menuAccess: any[] = [];
  childMenus: any[] = [];
  activeItem: string = '';
  userdetail: any;

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
      const parent = this.menuAccess.find(x => x.menuName === 'inputaggregator');
      if (parent) {
        this.childMenus = parent.children;
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

