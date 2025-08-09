import {Component} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatListItem, MatNavList} from '@angular/material/list';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'lajemacarts-sidebar',
  imports: [
    MatIcon,
    MatListItem,
    MatNavList,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <div class="sidebar">
      <div>
        <mat-nav-list>
          <a class="menu-item" mat-list-item routerLink="/tableau-de-bord/artworks" routerLinkActive="active-link">
            <mat-icon matListItemIcon>palette</mat-icon>
            <span matListItemTitle>Artworks</span>
          </a>
          <a class="menu-item" mat-list-item routerLink="/tableau-de-bord/materials" routerLinkActive="active-link">
            <mat-icon matListItemIcon>layers</mat-icon>
            <span matListItemTitle>Materials</span>
          </a>
          <a class="menu-item" mat-list-item routerLink="/tableau-de-bord/artwork-types" routerLinkActive="active-link">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Types</span>
          </a>
        </mat-nav-list>
      </div>
    </div>
  `,
  styleUrls: ['./sidebar.component.scss']

})
export class SidebarComponent {

}
