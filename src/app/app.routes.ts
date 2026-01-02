import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { TimingTableComponent } from './timing-table/timing-table.component';


export const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    title: 'Registro | Universal Timing',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registro | Universal Timing',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión | Universal Timing',
  },
  {
    path: 'setup-profile',
    loadComponent: () => import('./components/profile-setup/profile-setup.component').then(m => m.ProfileSetupComponent),
    title: 'Configurar Perfil | Universal Timing',
  },
  {
    path: 'dashboard',
    component: TimingTableComponent,
    title: 'F1 Dashboard | Universal Timing',
  },

  {
    path: 'profile',
    loadComponent: () => import('./components/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
    title: 'Mi Perfil | Universal Timing',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent),
    title: 'Calendario 2026 | Universal Timing',
  },
  {
    path: 'calendar/:round',
    loadComponent: () => import('./components/calendar-detail/calendar-detail.component').then(m => m.CalendarDetailComponent),
    title: 'Detalles de Carrera | Universal Timing',
  },
  {
    path: 'motogp',
    loadComponent: () => import('./components/motogp-timing/motogp-timing.component').then(m => m.MotoGPTimingComponent),
    title: 'MotoGP Timing | Universal Timing',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
