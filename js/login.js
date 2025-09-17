import { checkPassword } from './security.js';
import { showInitialSetup } from './init.js';

export function showLoginForm(root){
  root.innerHTML = `
    <div class="app-icon">
      <i class="ri-stethoscope-line"></i>
    </div>
    <h1 class="app-title">MediCare</h1>
    <p class="app-subtitle">Connectez-vous à votre espace professionnel</p>
    
    <div class="input-group">
      <label class="input-label">Mot de passe</label>
      <input type="password" id="pwd" placeholder="Saisissez votre mot de passe">
    </div>
    
    <button id="loginBtn" class="btn-primary">
      <i class="ri-arrow-right-line"></i>
      Se connecter
    </button>
    
    <div class="first-use-section">
      <p class="first-use-text">Première utilisation ?</p>
      <a href="#" id="initLink" class="first-use-link">Initialiser l'application</a>
    </div>
    
    <p id="msg" class="error-message hidden"></p>
  `;

  const loginBtn = document.getElementById('loginBtn');
  const initLink = document.getElementById('initLink');
  const msg = document.getElementById('msg');

  loginBtn.onclick = async () => {
    const pwd = document.getElementById('pwd').value.trim();
    if(!pwd) {
      showMessage(msg, 'Veuillez saisir votre mot de passe', 'error');
      return;
    }
    
    const ok = await checkPassword(pwd);
    if(ok){
      location.hash = '#dashboard';
    } else {
      showMessage(msg, 'Mot de passe incorrect', 'error');
    }
  };

  initLink.onclick = (e) => {
    e.preventDefault();
    showInitialSetup(root);
  };
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = type === 'error' ? 'error-message' : 'success-message';
  element.classList.remove('hidden');
  
  if(type === 'success') {
    setTimeout(() => {
      element.classList.add('hidden');
    }, 3000);
  }
}
