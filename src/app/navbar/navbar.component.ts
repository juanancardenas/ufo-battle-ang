import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../shared/service/user.service';
import { TokenmgrService } from '../shared/service/tokenmgr.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(public usrMgr: UserService, private tokenMgr: TokenmgrService, private router: Router) {}

  logout() {
    this.tokenMgr.deleteToken();
    this.usrMgr.setLogout();
    this.router.navigate(['/home']);
  }
}