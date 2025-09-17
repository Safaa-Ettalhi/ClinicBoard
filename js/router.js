import { showLogin, showDashboard } from './pages.js';

export function initRouter(){
  const root = document.getElementById('root');

  function renderPage(){
    const hash = location.hash.replace('#','');
    if(hash === 'dashboard'){
      showDashboard(root);
    } else {
      showLogin(root);
    }
  }

  window.addEventListener('hashchange', renderPage);
  window.addEventListener('load', renderPage);
}
