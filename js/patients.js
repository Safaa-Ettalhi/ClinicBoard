import { createNavigation, updateActiveNavItem } from './navigation.js';
import { getPatients, addPatient, updatePatient, deletePatient as removePatient, getAppointments } from './storage.js';

export function showPatients(root) {
  document.body.className = 'with-navigation';
  
  const patients = getPatients();
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <div class="header-info">
          <h1 class="content-title">Patients</h1>
          <p class="content-subtitle">Gestion de votre base de patients</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <i class="ri-user-line"></i>
            <span>${patients.length} patient${patients.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        <button id="addPatientBtn" class="btn-primary">
          <i class="ri-user-add-line"></i>
          Nouveau Patient
        </button>
      </div>
      
      <div class="content-body">
        <div class="search-filters-section">
          <div class="search-section">
            <div class="input-group">
              <input type="text" id="searchInput" placeholder="Rechercher par nom ou téléphone...">
              <i class="ri-search-line search-icon"></i>
            </div>
          </div>
          <div class="filters-section">
            <div class="filter-group">
              <label class="input-label">Trier par</label>
              <select id="sortSelect">
                <option value="name">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="date">Date d'ajout</option>
                <option value="date-desc">Plus récent</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="patients-grid" id="patientsList">
          ${patients.length > 0 ? 
            patients.map(patient => createPatientCard(patient)).join('') :
            createEmptyState()
          }
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('patients');
  setupPatientsEventListeners();
}

function createPatientCard(patient) {
  const createdDate = new Date(patient.createdAt).toLocaleDateString('fr-FR');
  const initials = getInitials(patient.fullName);
  
  return `
    <div class="patient-card" data-patient-id="${patient.id}">
      <div class="patient-header">
        <div class="patient-avatar">
          <span class="avatar-text">${initials}</span>
        </div>
        <div class="patient-actions">
          <button class="btn-action btn-history" onclick="showPatientHistory('${patient.id}')" title="Historique">
            <i class="ri-calendar-line"></i>
          </button>
          <button class="btn-action btn-edit" onclick="editPatient('${patient.id}')" title="Modifier">
            <i class="ri-edit-line"></i>
          </button>
          <button class="btn-action btn-delete" onclick="deletePatient('${patient.id}')" title="Supprimer">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      <div class="patient-content">
        <h3 class="patient-name">${patient.fullName || 'Nom non renseigné'}</h3>
        <div class="patient-details">
          ${patient.phone ? `
            <div class="detail-item">
              <i class="ri-phone-line"></i>
              <span>${patient.phone}</span>
            </div>
          ` : ''}
          ${patient.email ? `
            <div class="detail-item">
              <i class="ri-mail-line"></i>
              <span>${patient.email}</span>
            </div>
          ` : ''}
          <div class="detail-item">
            <i class="ri-calendar-line"></i>
            <span>Ajouté le ${createdDate}</span>
          </div>
        </div>
        ${patient.notes ? `
          <div class="patient-notes">
            <i class="ri-file-text-line"></i>
            <span>${patient.notes}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function createEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="ri-user-line"></i>
      </div>
      <h3>Aucun patient enregistré</h3>
      <p>Commencez par ajouter votre premier patient</p>
      <button class="btn-primary" onclick="document.getElementById('addPatientBtn').click()">
        <i class="ri-user-add-line"></i>
        Ajouter un patient
      </button>
    </div>
  `;
}

function setupPatientsEventListeners() {
  document.getElementById('addPatientBtn').onclick = showAddPatientModal;
  
  document.getElementById('searchInput').oninput = handleSearchAndSort;
  
  document.getElementById('sortSelect').onchange = handleSearchAndSort;
  
  window.editPatient = editPatient;
  window.deletePatient = deletePatient;
  window.showPatientHistory = showPatientHistory;
}

function showAddPatientModal() {
  const modal = createPatientModal();
  document.body.appendChild(modal);
}

function createPatientModal(patient = null) {
  const isEdit = patient !== null;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Modifier le patient' : 'Nouveau patient'}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="patientForm">
        <div class="input-group">
          <label class="input-label">Nom complet *</label>
          <input type="text" id="fullName" value="${patient?.fullName || ''}" required>
        </div>
        <div class="input-group">
          <label class="input-label">Téléphone</label>
          <input type="tel" id="phone" value="${patient?.phone || ''}">
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <input type="email" id="email" value="${patient?.email || ''}">
        </div>
        <div class="input-group">
          <label class="input-label">Notes</label>
          <textarea id="notes" rows="3">${patient?.notes || ''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Modifier' : 'Ajouter'}</button>
        </div>
      </form>
    </div>
  `;
  
  const closeModal = () => {
    document.body.removeChild(modal);
    delete window.closeModal;
  };
  
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  modal.querySelector('#patientForm').onsubmit = (e) => {
    e.preventDefault();
    handlePatientSubmit(patient?.id);
  };
  
  window.closeModal = closeModal;
  
  return modal;
}

function handlePatientSubmit(patientId) {
  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };
  
  if (!formData.fullName) {
    alert('Le nom complet est obligatoire');
    return;
  }
  
  if (patientId) {
    updatePatient(patientId, formData);
  } else {
    addPatient(formData);
  }
  
  window.closeModal();
  showPatients(document.getElementById('root'));
}

function editPatient(patientId) {
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  if (patient) {
    const modal = createPatientModal(patient);
    document.body.appendChild(modal);
  }
}

function showPatientHistory(patientId) {
  const patients = getPatients();
  const appointments = getAppointments();
  const patient = patients.find(p => p.id === patientId);
  
  if (!patient) return;
  
  const patientAppointments = appointments.filter(a => a.patientId === patientId);
  
  patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>Historique des rendez-vous - ${patient.fullName}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${patientAppointments.length === 0 ? `
          <div class="empty-state">
            <i class="ri-calendar-line"></i>
            <h3>Aucun rendez-vous</h3>
            <p>Ce patient n'a pas encore de rendez-vous enregistré</p>
          </div>
        ` : `
          <div class="appointments-history">
            ${patientAppointments.map(appointment => createHistoryItem(appointment)).join('')}
          </div>
        `}
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Fermer</button>
        <button type="button" class="btn-primary" onclick="createAppointmentForPatient('${patientId}')">
          <i class="ri-calendar-add-line"></i>
          Nouveau RDV
        </button>
      </div>
    </div>
  `;
  
  const closeModal = () => {
    document.body.removeChild(modal);
    delete window.closeModal;
  };
  
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  window.closeModal = closeModal;
  
  window.createAppointmentForPatient = (patientId) => {
    window.closeModal();
    window.location.hash = '#appointments';
    setTimeout(() => {
      const addBtn = document.getElementById('addAppointmentBtn');
      if (addBtn) {
        addBtn.click();
        setTimeout(() => {
          const patientSelect = document.getElementById('patientId');
          if (patientSelect) {
            patientSelect.value = patientId;
          }
        }, 100);
      }
    }, 100);
  };
  
  document.body.appendChild(modal);
}

function createHistoryItem(appointment) {
  const appointmentDate = new Date(appointment.date);
  const dateString = appointmentDate.toLocaleDateString('fr-FR');
  const timeString = appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  const statusColors = {
    'scheduled': '#3b82f6',
    'completed': '#10b981',
    'cancelled': '#ef4444',
    'no-show': '#6b7280'
  };
  
  const statusTexts = {
    'scheduled': 'Programmé',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
    'no-show': 'No-show'
  };
  
  return `
    <div class="history-item">
      <div class="history-date">
        <span class="date">${dateString}</span>
        <span class="time">${timeString}</span>
      </div>
      <div class="history-content">
        <h4>${appointment.type || 'Consultation'}</h4>
        <p>${appointment.practitioner || 'Dr. Martin'} - ${appointment.room || 'Salle non spécifiée'}</p>
        ${appointment.notes ? `<p class="notes">${appointment.notes}</p>` : ''}
      </div>
      <div class="history-status">
        <span class="status-badge" style="background: ${statusColors[appointment.status] || '#3b82f6'}">
          ${statusTexts[appointment.status] || 'Programmé'}
        </span>
      </div>
    </div>
  `;
}

function deletePatient(patientId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
    removePatient(patientId);
    showPatients(document.getElementById('root'));
  }
}

function handleSearchAndSort() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const sortBy = document.getElementById('sortSelect').value;
  const patients = getPatients();
  
  let filteredPatients = patients.filter(patient => 
    (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm)) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm))
  );
  
  filteredPatients.sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return (a.fullName || '').localeCompare(b.fullName || '');
      case 'name-desc':
        return (b.fullName || '').localeCompare(a.fullName || '');
      case 'date':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'date-desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });
  
  const patientsList = document.getElementById('patientsList');
  patientsList.innerHTML = filteredPatients.length > 0 ? 
    filteredPatients.map(patient => createPatientCard(patient)).join('') :
    createEmptySearchState();
}

function createEmptySearchState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="ri-search-line"></i>
      </div>
      <h3>Aucun patient trouvé</h3>
      <p>Essayez de modifier vos critères de recherche</p>
    </div>
  `;
}
