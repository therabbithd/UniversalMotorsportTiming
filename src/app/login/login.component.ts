import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../components/shared/feedback-modal/feedback-modal.component';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, MatDialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly isSubmitted = signal(false);
  readonly isLoading = signal(false);

  submit(): void {
    this.isSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService
      .login({
        email: email!,
        password: password!,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          this.dialog.open(FeedbackModalComponent, {
            data: {
              type: 'success',
              title: 'AUTH.LOGIN.SUCCESS_TITLE',
              message: 'AUTH.LOGIN.SUCCESS_MESSAGE',
              buttonText: 'COMMON.CONTINUE'
            },
            disableClose: true
          }).afterClosed().subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          const message =
            error.error?.message ||
            error.message ||
            'Error al iniciar sesión. Verifica tus credenciales.';

          this.dialog.open(FeedbackModalComponent, {
            data: {
              type: 'error',
              title: 'AUTH.LOGIN.ERROR_TITLE',
              message: message
            }
          });
        },
      });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

