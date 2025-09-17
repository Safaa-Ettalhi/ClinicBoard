export function showDashboard(root){
  root.innerHTML = `
    <div class="app-icon">
      <i class="ri-stethoscope-line"></i>
    </div>
    <h1 class="app-title">MediCare</h1>
    <p class="app-subtitle">Gestion de Cabinet Médical</p>
    
    <div class="dashboard-content">
      <h2 class="section-title">Tableau de bord</h2>
      <p class="section-description">Bienvenue dans votre espace professionnel</p>
      
      <div class="logout-section">
        <a href="#login" class="logout-link">
          <i class="ri-logout-box-line"></i>
          Déconnexion
        </a>
      </div>
    </div>
  `;
}
