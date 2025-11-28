import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../shared/service/user.service';
import { ToastService } from '../shared/service/toast.service';

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

  @ViewChild('password') passwordInput!: ElementRef<HTMLInputElement>;

  form = {
    userName: '',
    emailAddress: '',
    password: '',
    repeatPassword: ''
  };

  // Check all the fields has a value
  isFormValid(): boolean {
    return Object.values(this.form).every(v => v.trim() !== '');
  }

  // Check and register a new user
  registerNewUser() {
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

    this.registerUser();

    this.resetForm();
  }

  isUserRegistered() { 
    if (this.form.userName === '') return; // Evitar llamar al API con username = ''
    
    this.userService.userCheck(this.form.userName).subscribe({
      next: (response: any) => {
        const token: any = response.headers.get('Authorization');
        console.log(token);
        if (response.status === 200) {
          this.toast.show('User already exists', 'error');
        }
        else {
          this.toast.show('Unexpected response from the API, contact with your administrator', 'error');
          console.log('Response: ' + response);
        }
      },
      error: (error: any) => {
        console.log(error);
        if (error.status === 404) {
        } else {
          this.toast.show('Internal server error, contact with your administrator', 'error');
          console.log('Error: ' + error);
        }
      }
    })
  }

  registerUser() {
    // Registrar el nuevo usuario
    this.userService.registerUser(this.form.userName, this.form.password, this.form.emailAddress).subscribe({
      next: (response: any) => {
        const token: any = response.headers.get('Authorization');
        console.log(token);
        this.toast.show('Registration submitted', 'success');
      },
      error: (error: any) => {
        console.log(error);
        if (error.status === 400) {
          this.toast.show('No username or email or password', 'error');
        } else {
          if ( error.status === 409 )
            this.toast.show('Duplicated user name', 'error');
          else {
            console.log('Internal server error: ' + error);
          }
        }
      }
    });
  }

  resetForm() {
    this.form.userName = '',
    this.form.emailAddress = '',
    this.form.password = '',
    this.form.repeatPassword = ''
  }
}