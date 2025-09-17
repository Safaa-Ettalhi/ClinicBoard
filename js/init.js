import { savePassword } from './security.js';

export function showInitialSetup(root){
  root.innerHTML = `
    <div class="app-icon">
      <i class="ri-stethoscope-line"></i>
    </div>
    <h1 class="app-title">Configuration initiale</h1>
    <p class="section-description">Bienvenue dans MediCare !</p>
    <p class="section-description">Créez votre mot de passe pour sécuriser votre application.</p>
    
    <div class="input-group">
      <label class="input-label">Nouveau mot de passe</label>
      <input type="password" id="newPwd" placeholder="Saisissez votre mot de passe">
    </div>
    
    <div class="input-group">
      <label class="input-label">Confirmer le mot de passe</label>
      <input type="password" id="confirmPwd" placeholder="Confirmez votre mot de passe">
    </div>
    
    <button id="createBtn" class="btn-primary">
      <i class="ri-check-line"></i>
      Créer le mot de passe
    </button>
    
    <p id="msg" class="error-message hidden"></p>
  `;

  const createBtn = document.getElementById('createBtn');
  const msg = document.getElementById('msg');

  createBtn.onclick = async () => {
    const newPwd = document.getElementById('newPwd').value.trim();
    const confirmPwd = document.getElementById('confirmPwd').value.trim();
    
    if(!newPwd || !confirmPwd) {
      showMessage(msg, 'Veuillez remplir tous les champs', 'error');
      return;
    }
    
    if(newPwd !== confirmPwd) {
      showMessage(msg, 'Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    if(newPwd.length < 6) {
      showMessage(msg, 'Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    
    try {
      await savePassword(newPwd);
      showMessage(msg, 'Mot de passe créé avec succès !', 'success');
      setTimeout(() => {
        location.hash = '#dashboard';
      }, 1500);
    } catch (error) {
      showMessage(msg, 'Erreur lors de la création du mot de passe', 'error');
    }
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
