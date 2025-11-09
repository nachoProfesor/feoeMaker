import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ConvenioFormComponent } from './components/convenio-form/convenio-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdministracionComponent } from './components/administracion/administracion.component';
import { AlumnosComponent } from './components/alumnos/alumnos.component';
import { EmpresasComponent } from './components/empresas/empresas.component';
import { PropuestasComponent } from './components/propuestas/propuestas.component';
import { PfiEditorComponent } from './components/pfi-editor/pfi-editor.component';
import { PfiListComponent } from './components/pfi-list/pfi-list.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'inicio', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'administracion', 
    component: AdministracionComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'administracion/pfi/:cicloId', 
    component: PfiListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'administracion/pfi/nuevo/:cicloId', 
    component: PfiEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'administracion/pfi/editar/:pfiId', 
    component: PfiEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'alumnos', 
    component: AlumnosComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'empresas', 
    component: EmpresasComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'propuestas', 
    component: PropuestasComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'formulario', 
    component: ConvenioFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { path: '**', redirectTo: 'inicio' }
];
