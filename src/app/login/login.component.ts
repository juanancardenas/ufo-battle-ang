import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../shared/service/user.service';
import { TokenmgrService } from '../shared/service/tokenmgr.service';
import { ToastService } from '../shared/service/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private toast = inject(ToastService);

  username: string = '';
  password: string = '';

  constructor(private usrMgr: UserService, private tokenMgr: TokenmgrService) {}

  doLogin(): void {
    if (!this.username || !this.password) {
      this.toast.show('Enter your user and password', 'error');
      return;
    }

    // Subscribirse al servicio de Usuarios con el usuario / password introducidos por el usuario.
    // Hacer next: Obtener el token de autorización de la cabecera y guardarlo vía servicio 
    // gestor de token. Se borrará el que haya previo, si lo hay, y se guarda el nuevo.
    this.usrMgr.userLogin(this.username, this.password).subscribe({
      next: (response: any) => {
        const token: any = response.headers.get('Authorization');
        if (token) {
          this.tokenMgr.deleteToken();
          this.tokenMgr.saveToken(token);
          this.usrMgr.setLogin();
          this.toast.show('Log in successfully', 'info');
        } else {
          this.toast.show('Unexpected Log in error. No response from the API. Contact your administrator', 'error');
        }
      },
      error: (error: any) => {
        this.toast.show(`Error: ${error?.message ?? error}`, 'error');
      }
    });
  }
}