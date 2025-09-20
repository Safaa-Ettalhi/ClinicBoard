import { createNavigation, updateActiveNavItem } from './navigation.js';
import { getDashboardStats } from './storage.js';

export function showDashboard(root){
  document.body.className = 'with-navigation';
  
  const stats = getDashboardStats();
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <h1 class="content-title">Tableau de bord</h1>
        <p class="content-subtitle">Aperçu de votre activité</p>
    </div>
      
      <div class="content-body">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon green">
              <i class="ri-money-dollar-box-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Chiffre d'affaires mensuel</h3>
              <p class="stat-value">${stats.monthlyRevenues.toFixed(2)} DH</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon red">
              <i class="ri-money-euro-box-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Total dépenses</h3>
              <p class="stat-value">${stats.monthlyExpenses.toFixed(2)} DH</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon blue">
              <i class="ri-line-chart-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Marge (recettes - dépenses)</h3>
              <p class="stat-value">${stats.margin.toFixed(2)} DH</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon blue">
              <i class="ri-user-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Nombre de patients</h3>
              <p class="stat-value">${stats.totalPatients}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon orange">
              <i class="ri-calendar-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Nombre de consultations</h3>
              <p class="stat-value">${stats.totalAppointments}</p>
            </div>
          </div>
        </div>
        
        <div class="dashboard-layout">
          <div class="appointments-section">
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">Rendez-vous du jour</h2>
                <p class="section-subtitle">${stats.todayAppointments.length} rendez-vous programmés</p>
              </div>
              <a href="#appointments" class="see-all-link">Voir tout →</a>
            </div>
            
            <div class="appointments-list">
              ${stats.todayAppointments.length > 0 ? 
                stats.todayAppointments.map(appointment => `
                  <div class="appointment-card">
                    <div class="appointment-time">${new Date(appointment.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                    <div class="appointment-info">
                      <div class="patient-name">${appointment.patientName || 'Patient'}</div>
                      <div class="appointment-type">${appointment.type || 'Consultation'}</div>
                    </div>
                    <div class="status-badge scheduled">${appointment.status || 'PROGRAMMÉ'}</div>
                  </div>
                `).join('') :
                '<p style="text-align: center; color: #64748b; padding: 20px;">Aucun rendez-vous aujourd\'hui</p>'
              }
            </div>
          </div>
          
          <div class="quick-actions-section">
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">Actions rapides</h2>
                <p class="section-subtitle">Accédez rapidement aux fonctions principales</p>
              </div>
            </div>
            
            <div class="quick-actions-list">
              <a href="#patients" class="quick-action-card">
                <div class="action-icon">
                  <i class="ri-user-add-line"></i>
                </div>
                <span class="action-label">Nouveau Patient</span>
                <i class="ri-arrow-right-line action-arrow"></i>
              </a>
              
              <a href="#appointments" class="quick-action-card">
                <div class="action-icon">
                  <i class="ri-calendar-add-line"></i>
                </div>
                <span class="action-label">Ajouter RDV</span>
                <i class="ri-arrow-right-line action-arrow"></i>
              </a>
              
              <a href="#finances" class="quick-action-card">
                <div class="action-icon">
                  <i class="ri-money-dollar-box-line"></i>
                </div>
                <span class="action-label">Saisir Recette</span>
                <i class="ri-arrow-right-line action-arrow"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('dashboard');
}