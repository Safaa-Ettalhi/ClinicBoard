export function createNavigation() {
  return `
    <nav class="sidebar">
      <div class="nav-header">
        <div class="nav-logo">
          <div class="logo-icon">
            <i class="ri-stethoscope-line"></i>
          </div>
          <div class="logo-text">
            <h1 class="logo-title">MediCare</h1>
            <p class="logo-subtitle">Cabinet Médical</p>
          </div>
        </div>
      </div>
      
      <div class="nav-menu">
        <a href="#dashboard" class="nav-item active" data-page="dashboard">
          <i class="ri-dashboard-line"></i>
          <span>Tableau de bord</span>
        </a>
        <a href="#patients" class="nav-item" data-page="patients">
          <i class="ri-user-line"></i>
          <span>Patients</span>
        </a>
        <a href="#appointments" class="nav-item" data-page="appointments">
          <i class="ri-calendar-line"></i>
          <span>Rendez-vous</span>
        </a>
        <a href="#finances" class="nav-item" data-page="finances">
          <i class="ri-money-dollar-circle-line"></i>
          <span>Finances</span>
        </a>
      </div>
      
      <div class="nav-footer">
        <div class="user-profile">
          <div class="user-avatar">
            <i class="ri-user-line"></i>
          </div>
          <div class="user-info">
            <p class="user-name">Dr. Martin</p>
            <p class="user-role">Médecin généraliste</p>
          </div>
        </div>
        <a href="#login" class="logout-link">
          <i class="ri-logout-box-line"></i>
          <span>Déconnexion</span>
        </a>
      </div>
    </nav>
  `;
}

export function updateActiveNavItem(activePage) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if(item.dataset.page === activePage) {
      item.classList.add('active');
    }
  });
}
