import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'pp-application-menu',
  templateUrl: './application-menu.component.html',
  styleUrls: ['./application-menu.component.scss']
})
export class ApplicationMenuComponent implements OnInit {

  @ViewChild('labelNameElement', { static: true }) labelNameElement: ElementRef;

  labelName: string | undefined;

  menuOptions: any[] = [{
    name: 'Search',
    icon: 'search',
    link: 'content-picker'
  }, /*
  {
    name: 'Collections',
    icon: 'star_border',
    link: 'collections'
  }, */
  {
    name: 'Share manager',
    icon: 'share',
    link: 'share-manager'
  }, {
    name: 'Share viewer',
    icon: 'share',
    link: 'share-viewer'
  }, /*
  {
    name: 'Transfers',
    icon: 'swap_horiz',
    link: 'transfers'
  },*/
  {
    name: 'Lists',
    icon: 'reorder',
    link: 'list-item-picker'
  },
  /*{
    name: 'File Types',
    icon: 'insert_drive_file',
    link: 'file-types'
  },
  {
    name: 'Applications',
    icon: 'web_asset',
    link: 'applications'
  },
  {
    name: 'Settings',
    icon: 'tune',
    link: 'settings'
  },*/
  {
    name: 'Help',
    icon: 'contact_support',
    link: 'help'
  }];

  // VARS
  menuState = false;
  animateLogoState = false;

  constructor(
    private renderer: Renderer2,
  ) {}

  // ANIMATE LOGO
  animateLogo(): void {
    if (!this.menuState) {
      this.animateLogoState = true;
    } else {
      this.animateLogoState = false;
    }
  }

  // EXPAND MENU
  expandMenu(): void {
    if (this.menuState) {
      this.menuState = false;
    } else {
      this.menuState = true;
      this.animateLogoState = false;
    }
  }

  // DISPLAY LABEL ON HOVER
  showLabel(event: any, labelName: string): void {
    if (!this.menuState) {
      this.labelName = labelName;
      this.renderer.setStyle(this.labelNameElement.nativeElement, 'top', `${ event.target.offsetTop + 76 }px`);
      this.renderer.setStyle(this.labelNameElement.nativeElement, 'left', '70px');
    }
  }

  // HIDE LABEL
  hideLabel(): void {
    this.labelName = undefined;
  }

  ngOnInit() {}

}
