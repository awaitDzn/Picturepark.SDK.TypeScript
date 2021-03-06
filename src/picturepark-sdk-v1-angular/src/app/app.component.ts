import { Component, Inject, OnInit } from '@angular/core';

// LIBRARIES
import { AuthService } from '@picturepark/sdk-v1-angular';
import { OidcAuthService } from '@picturepark/sdk-v1-angular-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    @Inject(AuthService) public authService: OidcAuthService
  ) {}

  public ngOnInit() {
    if (!this.authService.isAuthenticated) {
      const path = location.pathname.replace('/elements/', '/');
      this.authService.login(path + location.search);
    }
  }

}
