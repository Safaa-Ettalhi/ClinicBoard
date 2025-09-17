import { showLoginForm } from './login.js';
import { showInitialSetup } from './init.js';
import { showDashboard } from './dashboard.js';

export function showLogin(root){
  const data = JSON.parse(localStorage.getItem('clinicTest') || '{}');
  
  if(!data.passwordHash){
    showInitialSetup(root);
  } else {
    showLoginForm(root);
  }
}

export { showDashboard };