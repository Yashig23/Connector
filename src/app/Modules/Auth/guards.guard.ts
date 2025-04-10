import { CanActivateFn, Router } from '@angular/router';

export const guardsGuard: CanActivateFn = (route, state) => {
  const router = new Router();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    router.navigate(['/login']); // Redirect to login page if not logged in
    return false;
  }

  return true; // Allow access if logged in
};
