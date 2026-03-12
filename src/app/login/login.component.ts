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

/**
 * Componente de inicio de sesión de la aplicación.
 * 
 * Este componente permite al usuario introducir sus credenciales (email y contraseña)
 * para autenticarse en el sistema utilizando el `AuthService`.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, MatDialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  /**
   * @ignore
   */
  private readonly fb = inject(FormBuilder);
  
  /**
   * @ignore
   */
  private readonly authService = inject(AuthService);
  
  /**
   * @ignore
   */
  private readonly router = inject(Router);
  
  /**
   * @ignore
   */
  private readonly dialog = inject(MatDialog);

  /**
   * Grupo de formulario reactivo para controlar los campos de email y contraseña.
   */
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  /**
   * Señal que indica si el formulario ha sido enviado, útil para mostrar errores de validación.
   */
  readonly isSubmitted = signal(false);
  
  /**
   * Señal que indica si hay un proceso de inicio de sesión en curso (Petición HTTP a la API).
   */
  readonly isLoading = signal(false);

  /**
   * Método que se ejecuta al enviar el formulario.
   * 
   * Valida los datos y llama al `AuthService` para realizar el inicio de sesión.
   * Si es exitoso, muestra un modal de éxito y redirige al inicio (`/`).
   * Si falla, muestra un modal de error con el mensaje correspondiente.
   * 
   * @returns Void. En caso de formulario inválido finaliza la ejecución de forma temprana.
   */
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

  /**
   * Obtiene el control del email del formulario reactivo.
   * 
   * @returns Control de formulario del campo email.
   */
  get email() {
    return this.loginForm.get('email');
  }

  /**
   * Obtiene el control de la contraseña del formulario reactivo.
   * 
   * @returns Control de formulario del campo password.
   */
  get password() {
    return this.loginForm.get('password');
  }
}

