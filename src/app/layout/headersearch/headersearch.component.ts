import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SessionStorageService } from '../../Shared/SessionStorageService';

interface MenuPermission {
  menuName: string;
  displayText: string;
  menuIcon: string;
  route: string;
  children: MenuChild[];
}

interface MenuChild {
  childmenuName: string;
  childdisplayText: string;
  childroute: string;
}

interface MenuSearchItem {
  menuName: string;
  displayText: string;
  route: string;
  menuIcon?: string;

  parentName?: string;
  childmenuName?: string;
}

@Component({
  selector: 'headersearch',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './headersearch.component.html',
  styleUrl: './headersearch.component.css'
})
export class HeadersearchComponent {

  menuSearchText: string = '';

  showMenuDropdown: boolean = false;

  menuSearchItems: MenuSearchItem[] = [];

  filteredMenus: MenuSearchItem[] = [];

  constructor(
    private router: Router,private _sessionStoreage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.loadMenuPermissions();

  }

  loadMenuPermissions(): void {
    const menuPermission = this._sessionStoreage.getItem('RoleAccess');

    if (!menuPermission) {
      return;
    }

    try {

      const menus: MenuPermission[] = JSON.parse(menuPermission);
      console.log('Menu Permissions:', menus);
      this.menuSearchItems = [];

      menus.forEach(menu => {

        this.menuSearchItems.push({
          menuName: menu.menuName,
          displayText: menu.displayText,
          route: menu.route,
          menuIcon: menu.menuIcon
        });

        /*
         * Add all children.
         */
        if (menu.children && menu.children.length > 0) {

          menu.children.forEach(child => {

            this.menuSearchItems.push({
              menuName: child.childmenuName,
              displayText: child.childdisplayText,
              route: child.childroute,
              menuIcon: menu.menuIcon,
              parentName: menu.displayText,
              childmenuName: child.childmenuName
            });

          });

        }

      });

      /*
       * Initially show all menus.
       */
      this.filteredMenus = [...this.menuSearchItems];

    }
    catch (error) {

      console.error(
        'Unable to parse menu permission JSON',
        error
      );

    }

  }

  openMenuSearch(): void {

    this.showMenuDropdown = true;

    this.filterMenus();

  }

  filterMenus(): void {

    const searchText = this.menuSearchText
      .trim()
      .toLowerCase();

    if (!searchText) {

      this.filteredMenus = [
        ...this.menuSearchItems
      ];

      return;
    }

    this.filteredMenus = this.menuSearchItems.filter(menu => {

      const menuName =
        menu.displayText?.toLowerCase() || '';

      const parentName =
        menu.parentName?.toLowerCase() || '';

      const internalName =
        menu.menuName?.toLowerCase() || '';

      return (
        menuName.includes(searchText) ||
        parentName.includes(searchText) ||
        internalName.includes(searchText)
      );

    });

  }

  navigateToMenu(route: string): void {

    this.showMenuDropdown = false;

    this.menuSearchText = '';

    this.router.navigateByUrl(route);

  }

  clearMenuSearch(): void {

    this.menuSearchText = '';

    this.filteredMenus = [
      ...this.menuSearchItems
    ];

  }

  @HostListener('document:click')
  closeMenuSearch(): void {

    this.showMenuDropdown = false;

  }

}
