import { showLoginForm } from './login.js';
import { showInitialSetup } from './init.js';
import { showDashboard } from './dashboard.js';
import { showPatients } from './patients.js';
import { showAppointments } from './appointments.js';
import { showFinances } from './finances.js';
import { getData } from './storage.js';
import { isAuthenticated } from './security.js';

export function initRouter(){
  const root = document.getElementById('root');

  function renderPage(){
    const hash = location.hash.replace('#','');
    
    const protectedPages = ['dashboard', 'patients', 'appointments', 'finances'];
    
    if(protectedPages.includes(hash) && !isAuthenticated()){
      location.hash = '#login';
      return;
    }
    
    switch(hash){
      case 'dashboard':
        showDashboard(root);
        break;
      case 'patients':
        showPatients(root);
        break;
      case 'appointments':
        showAppointments(root);
        break;
      case 'finances':
        showFinances(root);
        break;
      case 'login':
        document.body.className = 'with-sidebar';
        const data = getData();
        if(!data.auth?.passwordHash){
          showInitialSetup(root);
        } else {
          showLoginForm(root);
        }
        break;
      default:
        if(isAuthenticated()){
          location.hash = '#dashboard';
        } else {
          location.hash = '#login';
        }
    }
  }

  window.addEventListener('hashchange', renderPage);
  window.addEventListener('load', renderPage);
}
