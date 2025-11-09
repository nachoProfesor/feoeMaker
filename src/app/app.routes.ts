import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ConvenioFormComponent } from './components/convenio-form/convenio-form.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'formulario', 
    component: ConvenioFormComponent,
    canActivate: [authGuard] // Protegido: requiere autenticación
  },
  { 
    path: '', 
    redirectTo: 'formulario', 
    pathMatch: 'full' 
  },
  { path: '**', redirectTo: 'formulario' }
];
