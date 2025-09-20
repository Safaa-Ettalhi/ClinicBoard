import { checkPassword, isLockedOut, getLockoutTimeRemaining, handleFailedAttempt, resetFailedAttempts, getFailedAttempts, setAuthenticated } from './security.js';
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
  const pwdInput = document.getElementById('pwd');

  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = type === 'error' ? 'error-message' : 'success-message';
    msg.classList.remove('hidden');
    
    if(type === 'success') {
      setTimeout(() => {
        msg.classList.add('hidden');
      }, 3000);
    }
  }

  function disableInterface() {
    loginBtn.disabled = true;
    pwdInput.disabled = true;
    loginBtn.style.background = '#e53e3e';
  }

  function enableInterface() {
    loginBtn.disabled = false;
    pwdInput.disabled = false;
    loginBtn.style.background = '#2563eb';
    loginBtn.innerHTML = '<i class="ri-arrow-right-line"></i> Se connecter';
  }

  function checkLockoutStatus() {
    if(isLockedOut()){
      const remainingTime = getLockoutTimeRemaining();
      disableInterface();
      loginBtn.textContent = `Verrouillé (${remainingTime} min)`;
      showMessage(`Compte verrouillé. Réessayez dans ${remainingTime} minute(s)`, 'error');
      
      const checkInterval = setInterval(() => {
        if(!isLockedOut()){
          clearInterval(checkInterval);
          enableInterface();
          msg.classList.add('hidden');
        } else {
          const newTime = getLockoutTimeRemaining();
          loginBtn.textContent = `Verrouillé (${newTime} min)`;
          msg.textContent = `Compte verrouillé. Réessayez dans ${newTime} minute(s)`;
        }
      }, 30000);
    }
  }

  loginBtn.onclick = async () => {
    const pwd = pwdInput.value.trim();
    
    if(!pwd) {
      showMessage('Veuillez saisir votre mot de passe', 'error');
      return;
    }
    
    if(isLockedOut()){
      const remainingTime = getLockoutTimeRemaining();
      showMessage(`Compte verrouillé. Réessayez dans ${remainingTime} minute(s)`, 'error');
      return;
    }
    
    const ok = await checkPassword(pwd);
    
    if(ok){
      resetFailedAttempts();
      setAuthenticated(true);
      showMessage('Connexion réussie !', 'success');
      setTimeout(() => {
        location.hash = '#dashboard';
      }, 1000);
    } else {
      const attempts = handleFailedAttempt();
      const currentAttempts = getFailedAttempts();
      
      if(currentAttempts >= 3){
        disableInterface();
        loginBtn.textContent = 'Compte verrouillé';
        showMessage('Trop de tentatives échouées. Compte verrouillé pendant 5 minutes.', 'error');
        checkLockoutStatus();
      } else {
        const remainingAttempts = 3 - currentAttempts;
        showMessage(`Mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s)`, 'error');
      }
    }
  };

  initLink.onclick = (e) => {
    e.preventDefault();
    showInitialSetup(root);
  };

  checkLockoutStatus();
}