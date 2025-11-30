import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { UserService } from '../shared/service/user.service';
import { ToastService } from '../shared/service/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  // Inyecto los servicios por constructor
  constructor(private router: Router, protected usrMgr: UserService, private toast: ToastService) {}

  logout() {
    this.usrMgr.closeSession();
    this.router.navigate(['/home']);
    this.toast.show("Log out realizado satisfactoriamente","info");
  }
}