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
      ]]
    });
  }

  onSubmit() {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      console.log('Email:', email);
      console.log('Password:', password);
      // this.backendService.postDataBeforeLogin('login', this.signInForm.value).subscribe((res)=>{
      //   console.log(res);
      //   if(res.success) {
      //     console.log('success');
      //   }
      //   else {
      //     console.log(res.details);
      //   }
        
      // },(error)=>{
      //   console.log('error')
      // })
    }
  }

  onSignUpSubmit() {
    if (this.signUpForm.valid) {
      const { first_name, last_name, email, password } = this.signUpForm.value;
      console.log('First Name:', first_name);
      console.log('Last Name:', last_name);
      console.log('Email:', email);
      console.log('Password:', password);
      // Add your registration logic here
    }
  }
  
  clickEvent(event: MouseEvent) {
    // this.hide.set(!this.hide());
    event.stopPropagation();
  }

}
