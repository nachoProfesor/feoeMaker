import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ConvenioFormComponent } from './components/convenio-form/convenio-form.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: ConvenioFormComponent,
    // canActivate: [authGuard] // Descomentar cuando quieras activar la protección
  },
  { path: '**', redirectTo: '' }
];
