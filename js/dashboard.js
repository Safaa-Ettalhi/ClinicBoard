import { createNavigation, updateActiveNavItem } from './navigation.js';
import { getDashboardStats } from './storage.js';

export function showDashboard(root){
  document.body.className = 'with-navigation';
  
  const stats = getDashboardStats();
  
  const today = new Date();
  const currentMonth = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const currentDay = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <div class="header-info">
          <h1 class="content-title">Tableau de bord</h1>
          <p class="content-subtitle">Aperçu de votre activité - ${currentDay}</p>
        </div>
        <div class="header-actions">
          <div class="date-badge">
            <i class="ri-calendar-line"></i>
            <span>${currentMonth}</span>
          </div>
        </div>
      </div>
      
      <div class="content-body">
        <div class="stats-grid">
          <div class="stat-card revenue">
            <div class="stat-icon">
              <i class="ri-money-dollar-box-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">Chiffre d'affaires</h3>
                <p class="stat-value">${stats.monthlyRevenues.toFixed(2)} DH</p>
              </div>
              <div class="stat-trend positive">
                <i class="ri-arrow-up-line"></i>
                <span>Mensuel</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card expenses">
            <div class="stat-icon">
              <i class="ri-money-euro-box-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">Total dépenses</h3>
                <p class="stat-value">${stats.monthlyExpenses.toFixed(2)} DH</p>
              </div>
              <div class="stat-trend negative">
                <i class="ri-arrow-down-line"></i>
                <span>Mensuel</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card margin">
            <div class="stat-icon">
              <i class="ri-line-chart-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">Marge nette</h3>
                <p class="stat-value">${stats.margin.toFixed(2)} DH</p>
              </div>
              <div class="stat-trend ${stats.margin >= 0 ? 'positive' : 'negative'}">
                <i class="ri-${stats.margin >= 0 ? 'arrow-up' : 'arrow-down'}-line"></i>
                <span>${stats.margin >= 0 ? 'Bénéfice' : 'Déficit'}</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card patients">
            <div class="stat-icon">
              <i class="ri-user-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">Patients</h3>
                <p class="stat-value">${stats.totalPatients}</p>
              </div>
              <div class="stat-trend neutral">
                <i class="ri-user-add-line"></i>
                <span>Total</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card appointments">
            <div class="stat-icon">
              <i class="ri-calendar-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">Consultations</h3>
                <p class="stat-value">${stats.totalAppointments}</p>
              </div>
              <div class="stat-trend neutral">
                <i class="ri-calendar-check-line"></i>
                <span>Total</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-sections">
          <div class="quick-actions-section">
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">
                  <i class="ri-flashlight-line"></i>
                  Actions rapides
                </h2>
                <p class="section-subtitle">Accédez rapidement aux fonctions principales</p>
              </div>
            </div>
            
            <div class="quick-actions-grid">
              <a href="#patients" class="quick-action-card">
                <div class="action-icon patients">
                  <i class="ri-user-add-line"></i>
                </div>
                <div class="action-content">
                  <h3 class="action-title">Nouveau Patient</h3>
                  <p class="action-description">Ajouter un nouveau patient</p>
                </div>
                <div class="action-arrow">
                  <i class="ri-arrow-right-line"></i>
                </div>
              </a>
              
              <a href="#appointments" class="quick-action-card">
                <div class="action-icon appointments">
                  <i class="ri-calendar-add-line"></i>
                </div>
                <div class="action-content">
                  <h3 class="action-title">Ajouter RDV</h3>
                  <p class="action-description">Programmer un rendez-vous</p>
                </div>
                <div class="action-arrow">
                  <i class="ri-arrow-right-line"></i>
                </div>
              </a>
              
              <a href="#finances" class="quick-action-card">
                <div class="action-icon finances">
                  <i class="ri-money-dollar-box-line"></i>
                </div>
                <div class="action-content">
                  <h3 class="action-title">Saisir Recette</h3>
                  <p class="action-description">Enregistrer un paiement</p>
                </div>
                <div class="action-arrow">
                  <i class="ri-arrow-right-line"></i>
                </div>
              </a>
              
              <a href="#finances" class="quick-action-card">
                <div class="action-icon expenses">
                  <i class="ri-money-euro-box-line"></i>
                </div>
                <div class="action-content">
                  <h3 class="action-title">Ajouter Dépense</h3>
                  <p class="action-description">Enregistrer une dépense</p>
                </div>
                <div class="action-arrow">
                  <i class="ri-arrow-right-line"></i>
                </div>
              </a>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">
                  <i class="ri-bar-chart-line"></i>
                  Résumé du mois
                </h2>
                <p class="section-subtitle">Performance financière de ${currentMonth}</p>
              </div>
            </div>
            
            <div class="summary-cards">
              <div class="summary-card">
                <div class="summary-icon revenue">
                  <i class="ri-money-dollar-box-line"></i>
                </div>
                <div class="summary-content">
                  <h3 class="summary-title">Recettes</h3>
                  <p class="summary-value">${stats.monthlyRevenues.toFixed(2)} DH</p>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon expenses">
                  <i class="ri-money-euro-box-line"></i>
                </div>
                <div class="summary-content">
                  <h3 class="summary-title">Dépenses</h3>
                  <p class="summary-value">${stats.monthlyExpenses.toFixed(2)} DH</p>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon margin">
                  <i class="ri-line-chart-line"></i>
                </div>
                <div class="summary-content">
                  <h3 class="summary-title">Marge</h3>
                  <p class="summary-value ${stats.margin >= 0 ? 'positive' : 'negative'}">${stats.margin.toFixed(2)} DH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('dashboard');
}