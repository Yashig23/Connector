import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { guardsGuard } from './Modules/Auth/guards.guard';

const routes: Routes = [{
  path: 'login',
  loadChildren: () => import('./Modules/Auth/auth/auth.module').then(m => m.AuthModule),
},
{
  path: '',
  loadChildren: () => import('./Modules/shared/shared.module').then(m => m.SharedModule),
  canActivate: [guardsGuard]
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
