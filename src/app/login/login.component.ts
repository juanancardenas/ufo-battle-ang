import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../shared/service/user.service';
import { TokenmgrService } from '../shared/service/tokenmgr.service';
import { ToastService } from '../shared/service/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private toast = inject(ToastService);

  constructor(private usrMgr: UserService, private tokenMgr: TokenmgrService) {}

  username: string = '';
  password: string = '';
  userSubscription?: Subscription;
  private router = inject(Router);

  // Limpieza al destruir el componente
  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  // Hacer login
  doLogin(event?: Event): void {
    if(event) event.preventDefault();

    if (!this.username || !this.password) {
      this.toast.show('Enter your user and password', 'error');
      return;
    }

    // Subscribirse al servicio de Usuarios con el usuario / password introducidos por el usuario.
    // Hacer next: Obtener el token de autorización de la cabecera y guardarlo vía servicio 
    // gestor de token. Se borrará el que haya previo, si lo hay, y se guarda el nuevo.
    this.userSubscription = this.usrMgr.userLogin(this.username, this.password).subscribe({
      next: (response: any) => {
        const token: any = response.headers.get('Authorization');
        if (token) {
          this.usrMgr.createSession(this.username, token);
          this.toast.show('Log in successfully', 'info');
          this.router.navigate(['/preferences']); // Se navega a preferences para el usuario inicie el juego
        } else {
          this.toast.show('Unexpected Log in error. No response from the API. Contact your administrator', 'error');
        }
      },
      error: (error: any) => {
        if (error.status == 401) {
          this.toast.show('Authorization error, check your user and password are correct', 'error');
        } else {
          this.toast.show(`Error: ${error?.message ?? error}`, 'error');
        }
      }
    });
  }
}