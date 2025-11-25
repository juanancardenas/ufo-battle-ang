import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../shared/service/user.service';
import { TokenmgrService } from '../shared/service/tokenmgr.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  @ViewChild('errorContainer', { static: true }) errorContainer!: ElementRef;

  username: string = '';
  password: string = '';

  private messageTimeout: any;

  constructor(private usrMgr: UserService, private tokenMgr: TokenmgrService, private renderer: Renderer2) {}

  doLogin(): void {
    if (!this.username || !this.password) {
      this.showMessage('Introduzca usuario y password', true);
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
          this.showMessage('Login realizado con éxito.', false);
        } else {
          this.showMessage('Error en Login: Token no recibido. Hay una incidencia en la API. Pruebe más tarde.', true);
        }
      },
      error: (err: any) => {
        this.showMessage(`Error en Login: ${err?.message ?? err}`, true);
      }
    });
  }

  private showMessage(message: string, isError: boolean) {
    // Limpia contenido previo
    this.renderer.setProperty(this.errorContainer.nativeElement, 'textContent', '');

    // Crea un <p> para el mensaje
    const p = this.renderer.createElement('p');
    const text = this.renderer.createText(message);
    this.renderer.appendChild(p, text);
    this.renderer.appendChild(this.errorContainer.nativeElement, p);

    if (!isError) {
      this.renderer.addClass(p,"success-message");
    } else {
      this.renderer.addClass(p,"error-message");
    }

    // Limpiar cualquier timeout previo
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    // Ocultar el mensaje tras 5 segundos
    this.messageTimeout = setTimeout(() => {
      this.renderer.removeChild(this.errorContainer.nativeElement, p);
      this.messageTimeout = null;
    }, 5000);
  }

  ngOnDestroy() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }
}