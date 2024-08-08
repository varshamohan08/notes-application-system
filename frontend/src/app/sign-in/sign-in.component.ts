import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BackendService } from '../backend.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

export function PasswordMatchValidator(control: FormGroup) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
  } else {
    confirmPassword?.setErrors(null);
  }
  return null;
}
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule
    // BrowserAnimationsModule, // required animations module
    // ToastrModule.forRoot(),
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  // hide = signal(true);
  signInForm: FormGroup;
  signUpForm: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.signUpForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$')
      ]],
      confirmPassword:['', [
        Validators.required,

      ]]
    }, { validator: PasswordMatchValidator });
  }

  onSubmit() {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      console.log('Email:', email);
      console.log('Password:', password);
      this.backendService.postDataBeforeLogin('login', this.signInForm.value).subscribe((res)=>{
        console.log(res);
        if(res.success) {
          console.log('success');
          this.authService.setToken(res.access_token, res.user_details)
          setTimeout(() => {
            console.log(this.authService.isAuthenticated());
            
            if (this.authService.isAuthenticated()) {
              this.router.navigateByUrl('');
            }
          }, 5000);
        }
        else {
          console.log(res.details);
        }
        
      },(error)=>{
        console.log('error')
      })
    }
  }

  onSignUpSubmit() {
    if (this.signUpForm.valid) {
        const { first_name, last_name, email, password } = this.signUpForm.value;
        console.log('First Name:', first_name);
        console.log('Last Name:', last_name);
        console.log('Email:', email);
        console.log('Password:', password);

        this.backendService.postDataBeforeLogin('sign_up', this.signUpForm.value).subscribe((res) => {
            console.log(res);
            if (res.success) {
                console.log('success');
                
                new Promise((resolve) => {
                  localStorage.setItem('access_token', res.access_token);
                  localStorage.setItem('userdetails', JSON.stringify(res.user_details));
                  resolve(localStorage.getItem('access_token') == res.access_token);
                }).then(() => {
                  this.router.navigateByUrl('');
                });
            } else {
              this.toastr.error('Error', res.details)
                console.log(res);
            }
        }, (error) => {
          this.toastr.error('Error', error)
            console.log('error');
        });
    }
}

  
  clickEvent(event: MouseEvent) {
    // this.hide.set(!this.hide());
    event.stopPropagation();
  }

}
