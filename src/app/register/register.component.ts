import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../components/shared/feedback-modal/feedback-modal.component';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Validador personalizado para comprobar que las contraseñas ingresadas coincidan.
 * 
 * @param control El control de formulario abstracto padre (el FormGroup del registro).
 * @returns Retorna un error `passwordMismatch: true` si no coinciden, o `null` si son idénticas o faltan campos.
 */
const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  if (!password || !confirm) {
    return null;
  }

  return password !== confirm ? { passwordMismatch: true } : null;
};

/**
 * Componente de registro de usuario en la aplicación.
 * 
 * Este componente permite al nuevo usuario proporcionar sus datos básicos (nombre, email y contraseña) 
 * para crear una cuenta nueva y posteriormente llevarlo al flujo de configuración de perfil.
 */
@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, MatDialogModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  /** @ignore */
  private readonly fb = inject(FormBuilder);
  
  /** @ignore */
  private readonly authService = inject(AuthService);
  
  /** @ignore */
  private readonly router = inject(Router);
  
  /** @ignore */
  private readonly dialog = inject(MatDialog);

  /**
   * Grupo de formulario reactivo con todos los datos necesarios para registrar al usuario, 
   * incluyendo la validación a nivel de todo el grupo (`passwordMatchValidator`).
   */
  readonly registrationForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator },
  );

  /**
   * Señal que indica si el formulario ha sido interactuado para enviar, usado para mostrar errores.
   */
  readonly isSubmitted = signal(false);
  
  /**
   * Señal de estado de carga asíncrona conectada al API de registro.
   */
  readonly isLoading = signal(false);

  /**
   * Señal computada para verificar de forma unificada si existe el error de 'passwordMismatch' y 
   * si el usuario ya ha interactuado con los controles correspondientes.
   */
  readonly passwordMismatch = computed(() => {
    const confirmTouched = this.confirmPassword?.touched;
    return (
      this.registrationForm.hasError('passwordMismatch') &&
      (confirmTouched || this.isSubmitted())
    );
  });

  /**
   * Procesa el formulario de registro y contacta con el `AuthService`.
   * 
   * Al enviarlo correctamente muestra un modal informativo de éxito y dirige a 
   * `/setup-profile` para completar la creación de la cuenta.
   * 
   * @returns Void
   */
  submit(): void {
    this.isSubmitted.set(true);

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { fullName, email, password } = this.registrationForm.value;

    this.authService
      .register({
        name: fullName!,
        email: email!,
        password: password!,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          this.dialog.open(FeedbackModalComponent, {
            data: {
              type: 'success',
              title: 'AUTH.REGISTER.SUCCESS_TITLE',
              message: 'AUTH.REGISTER.SUCCESS_MESSAGE',
              buttonText: 'COMMON.CONTINUE'
            },
            disableClose: true
          }).afterClosed().subscribe(() => {
            this.router.navigate(['/setup-profile']);
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          const message =
            error.error?.message ||
            error.message ||
            'Error al crear la cuenta. Por favor, intenta de nuevo.';

          this.dialog.open(FeedbackModalComponent, {
            data: {
              type: 'error',
              title: 'AUTH.REGISTER.ERROR_TITLE',
              message: message
            }
          });
        },
      });
  }

  /**
   * Obtiene el control de nombre completo del formulario.
   */
  get fullName() {
    return this.registrationForm.get('fullName');
  }

  /**
   * Obtiene el control de email del formulario.
   */
  get email() {
    return this.registrationForm.get('email');
  }

  /**
   * Obtiene el control de la contraseña original del formulario.
   */
  get password() {
    return this.registrationForm.get('password');
  }

  /**
   * Obtiene el control de confirmación de contraseña del formulario.
   */
  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }
}

