import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'rc-login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  message;

  constructor(private fb: FormBuilder, private _authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this._authService.user && this._authService.user.type === 'default') {
      this.router.navigate(['/']);
    }
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this._authService.login(this.loginForm.value)
    .subscribe(
      (res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/']);
        }
        if (res.message) {
          this.message = res.message;
        }
      }
    );
  }
}
