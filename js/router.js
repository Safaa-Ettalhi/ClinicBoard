import { showLoginForm } from './login.js';
import { showInitialSetup } from './init.js';
import { showDashboard } from './dashboard.js';
import { showPatients } from './patients.js';
import { showAppointments } from './appointments.js';
import { showFinances } from './finances.js';
import { getData } from './storage.js';

export function initRouter(){
  const root = document.getElementById('root');

  function renderPage(){
    const hash = location.hash.replace('#','');
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
      default:
        document.body.className = 'with-sidebar';
        const data = getData();
        if(!data.auth?.passwordHash){
          showInitialSetup(root);
        } else {
          showLoginForm(root);
        }
    }
  }

  window.addEventListener('hashchange', renderPage);
  window.addEventListener('load', renderPage);
}
