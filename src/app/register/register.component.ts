import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../shared/service/user.service';
import { ToastService } from '../shared/service/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private userService = inject(UserService);
  private toast = inject(ToastService);

  private subscriptions: Subscription[] = [];

  @ViewChild('password') passwordInput!: ElementRef<HTMLInputElement>;

  form = {
    userName: '',
    emailAddress: '',
    password: '',
    repeatPassword: ''
  };

  // Limpieza de subscripciones
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.length = 0;
  }

  // Check all the fields has a value
  private isFormValid(): boolean {
    return Object.values(this.form).every(v => (v ?? '').toString().trim() !== '');
  }

  // Chequea y registra un nuevo usuario vía API
  registerNewUser(regForm: NgForm) {
    if (!this.isFormValid()) {
      this.toast.show('Please enter all the fields correctly', 'error');
      return;
    }

    if (this.userService.isLoggedIn()) {
      this.toast.show('User is already logged in. Please log out before registering a new user', 'error');
      return;
    }

    if (this.form.password !== this.form.repeatPassword) {
      this.form.password = "";
      this.form.repeatPassword = "";
      this.passwordInput.nativeElement.focus();
      this.toast.show('Passwords do not match', 'error');
      return;
    }

    this.registerUser(); // Registar nuevo usuario
    regForm.reset();     // Refrescar formulario
  }

  // Valida que el usuario sólo contenga números, letras y guiones.
  isValidUsername(username: string): boolean {
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(username);
  }
  
  // Chequea si el usuario existe en el API
  isUserRegistered(regForm: NgForm) { 
    if (!this.isValidUsername(this.form.userName) || !this.form.userName) {
      regForm.reset();
      return;
    }

    this.subscriptions.push(
      this.userService.userCheck(this.form.userName).subscribe({
        next: (response: any) => {
          const token: any = response.headers.get('Authorization');
          console.log(token);
          if (response.status == 200) {
            this.toast.show('User already exists', 'error');
            regForm.reset(); // Refrescar formulario
          }
          else {
            this.toast.show('Unexpected response from the API, contact with your administrator', 'info');
            console.log('Response: ' + response);
          }
        },
        error: (error: any) => {
          console.log(error);
          if (error.status == 404) {
            // Nothing to do... the username can be used in the register
            //console.log("404: ", error.error);
          } else {
            this.toast.show('Internal server error, contact with your administrator', 'error');
            console.log('Error: ' + error);
          }
        }
      })
    )
  }

  // Registrar el nuevo usuario llamando al API
  private registerUser() {
    
    this.subscriptions.push(
      this.userService.registerUser(this.form.userName, this.form.password, this.form.emailAddress).subscribe({
        next: (response: any) => {
          if ( response.status == 201 )
            this.toast.show('Registration submitted', 'success');
          else {
            this.toast.show('Unexpected response from the API, contact with your administrator', 'info');
            console.log('Response: ' + response);
          }
        },
        error: (error: any) => {
          switch (error.status) {
            case 400:
              this.toast.show('No username or email or password', 'error');
              break;

            case 409:
              this.toast.show('Duplicated user name', 'error');
              break;

            default:
              this.toast.show('Internal server error: ' + error, 'error');
              break;
          }
        }
      })
    );
  }
}