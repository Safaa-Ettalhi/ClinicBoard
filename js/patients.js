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
          <h1 class="content-title">Gestion des Patients</h1>
          <p class="content-subtitle">${patients.length} patients enregistrés</p>
        </div>
        <button id="addPatientBtn" class="btn-primary">
          <i class="ri-add-line"></i>
          Nouveau Patient
        </button>
      </div>
      
      <div class="content-body">
          <div class="search-section">
          <div class="search-container">
            <input type="text" id="searchInput" placeholder="Rechercher un patient...">
            <button class="search-btn">
              <i class="ri-search-line"></i>
            </button>
          </div>
          <div class="search-results" id="searchResults">
            ${patients.length} patient(s) trouvé(s)
          </div>
        </div>
        
        <div class="patients-table-container">
          <div class="table-header">
            <h3>Liste des Patients</h3>
            <p>Gérez les informations de vos patients</p>
          </div>
          
          <div class="patients-table" id="patientsTable">
            <div class="table-header-row">
              <div class="table-cell">Patient</div>
              <div class="table-cell">Contact</div>
              <div class="table-cell">Age</div>
              <div class="table-cell">Groupe Sanguin</div>
              <div class="table-cell">Dernière Visite</div>
              <div class="table-cell">Statut</div>
              <div class="table-cell">Actions</div>
            </div>
            
            <div class="table-body" id="patientsList">
          ${patients.length > 0 ? 
                patients.map(patient => createPatientRow(patient)).join('') :
                createEmptyTableState()
          }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('patients');
  setupPatientsEventListeners();
}

function createPatientRow(patient) {
  const initials = getInitials(patient.fullName);
  const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Jamais';
  const statusClass = patient.status === 'active' ? 'active' : 'inactive';
  const statusText = patient.status === 'active' ? 'ACTIF' : 'INACTIF';
  
  return `
    <div class="table-row" data-patient-id="${patient.id}">
      <div class="table-cell patient-cell">
        <div class="patient-info">
        <div class="patient-avatar">
          <span class="avatar-text">${initials}</span>
        </div>
          <div class="patient-details">
            <div class="patient-name">${patient.fullName || 'Nom non renseigné'}</div>
            <div class="patient-id">${patient.id.substring(0, 5).toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div class="table-cell contact-cell">
        <div class="contact-info">
          ${patient.phone ? `
            <div class="contact-item">
              <i class="ri-phone-line"></i>
              <span>${patient.phone}</span>
            </div>
          ` : ''}
          ${patient.email ? `
            <div class="contact-item">
              <i class="ri-mail-line"></i>
              <span>${patient.email}</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="table-cell age-cell">
        ${patient.age || 0} ans
      </div>
      <div class="table-cell blood-group-cell">
        ${patient.bloodGroup || 'Non spécifié'}
      </div>
      <div class="table-cell last-visit-cell">
        ${lastVisit}
      </div>
      <div class="table-cell status-cell">
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="table-cell actions-cell">
        <div class="action-buttons">
          <button class="action-btn view-btn" onclick="viewPatient('${patient.id}')" title="Voir">
            <i class="ri-eye-line"></i>
          </button>
          <button class="action-btn edit-btn" onclick="editPatient('${patient.id}')" title="Modifier">
            <i class="ri-edit-line"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deletePatient('${patient.id}')" title="Supprimer">
            <i class="ri-delete-bin-line"></i>
          </button>
          </div>
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

function createEmptyTableState() {
  return `
    <div class="empty-table-state">
      <div class="empty-icon">
        <i class="ri-user-line"></i>
      </div>
      <h3>Aucun patient trouvé</h3>
      <p>Commencez par ajouter votre premier patient</p>
    </div>
  `;
}

function setupPatientsEventListeners() {
  document.getElementById('addPatientBtn').onclick = showAddPatientModal;
  
  document.getElementById('searchInput').oninput = handleSearch;
  
  window.editPatient = editPatient;
  window.deletePatient = deletePatient;
  window.viewPatient = viewPatient;
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
          <label class="input-label">Âge</label>
          <input type="number" id="age" value="${patient?.age || ''}" min="0" max="150">
        </div>
        <div class="input-group">
          <label class="input-label">Groupe sanguin</label>
          <select id="bloodGroup">
            <option value="">Sélectionner</option>
            <option value="A+" ${patient?.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
            <option value="A-" ${patient?.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
            <option value="B+" ${patient?.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
            <option value="B-" ${patient?.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
            <option value="AB+" ${patient?.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
            <option value="AB-" ${patient?.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
            <option value="O+" ${patient?.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
            <option value="O-" ${patient?.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Statut</label>
          <select id="status">
            <option value="active" ${patient?.status === 'active' ? 'selected' : ''}>Actif</option>
            <option value="inactive" ${patient?.status === 'inactive' ? 'selected' : ''}>Inactif</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Allergies</label>
          <input type="text" id="allergies" value="${patient?.allergies || ''}" placeholder="Ex: Pénicilline, Pollen...">
        </div>
        <div class="input-group">
          <label class="input-label">Médicaments actuels</label>
          <input type="text" id="medications" value="${patient?.medications || ''}" placeholder="Ex: Aspirine, Vitamine D...">
        </div>
        <div class="input-group">
          <label class="input-label">Antécédents médicaux</label>
          <textarea id="medicalHistory" rows="3" placeholder="Ex: Diabète, Hypertension...">${patient?.medicalHistory || ''}</textarea>
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
    age: parseInt(document.getElementById('age').value) || 0,
    bloodGroup: document.getElementById('bloodGroup').value,
    status: document.getElementById('status').value,
    allergies: document.getElementById('allergies').value.trim(),
    medications: document.getElementById('medications').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim(),
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

function viewPatient(patientId) {
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  if (patient) {
    const modal = createPatientViewModal(patient);
    document.body.appendChild(modal);
  }
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

function createPatientViewModal(patient) {
  const appointments = getAppointments();
  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const lastAppointment = patientAppointments.length > 0 ? 
    patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
  
  const createdDate = new Date(patient.createdAt).toLocaleDateString('fr-FR');
  const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Jamais';
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content patient-details-modal">
      <div class="modal-header">
        <div class="patient-header-info">
          <div class="patient-avatar-large">
            <span class="avatar-text">${getInitials(patient.fullName)}</span>
          </div>
          <div class="patient-header-details">
            <h2>${patient.fullName || 'Nom non renseigné'}</h2>
            <p class="patient-id">ID: ${patient.id.substring(0, 8).toUpperCase()}</p>
            <span class="status-badge ${patient.status || 'active'}">${patient.status === 'active' ? 'ACTIF' : 'INACTIF'}</span>
          </div>
        </div>
        <button class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="patient-details-tabs">
          <div class="tab-buttons">
            <button class="tab-btn active" data-tab="info">Informations</button>
            <button class="tab-btn" data-tab="medical">Médical</button>
            <button class="tab-btn" data-tab="appointments">Rendez-vous</button>
            <button class="tab-btn" data-tab="history">Historique</button>
          </div>
          
          <div class="tab-content active" id="info-tab">
            <div class="detail-sections">
              <div class="detail-section">
                <h3><i class="ri-user-line"></i> Informations personnelles</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Nom complet</label>
                    <span>${patient.fullName || 'Non renseigné'}</span>
                  </div>
                  <div class="detail-item">
                    <label>Âge</label>
                    <span>${patient.age || 0} ans</span>
                  </div>
                  <div class="detail-item">
                    <label>Date d'inscription</label>
                    <span>${createdDate}</span>
                  </div>
                  <div class="detail-item">
                    <label>Dernière visite</label>
                    <span>${lastVisit}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h3><i class="ri-phone-line"></i> Contact</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Téléphone</label>
                    <span>${patient.phone || 'Non renseigné'}</span>
                  </div>
                  <div class="detail-item">
                    <label>Email</label>
                    <span>${patient.email || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
              
              ${patient.notes ? `
                <div class="detail-section">
                  <h3><i class="ri-file-text-line"></i> Notes</h3>
                  <div class="notes-content">
                    <p>${patient.notes}</p>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="tab-content" id="medical-tab">
            <div class="detail-sections">
              <div class="detail-section">
                <h3><i class="ri-heart-pulse-line"></i> Informations médicales</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Groupe sanguin</label>
                    <span class="blood-group">${patient.bloodGroup || 'Non spécifié'}</span>
                  </div>
                  <div class="detail-item">
                    <label>Allergies</label>
                    <span>${patient.allergies || 'Aucune connue'}</span>
                  </div>
                  <div class="detail-item">
                    <label>Médicaments actuels</label>
                    <span>${patient.medications || 'Aucun'}</span>
                  </div>
                  <div class="detail-item">
                    <label>Antécédents médicaux</label>
                    <span>${patient.medicalHistory || 'Aucun'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="appointments-tab">
            <div class="detail-sections">
              <div class="detail-section">
                <h3><i class="ri-calendar-line"></i> Rendez-vous récents</h3>
                ${patientAppointments.length > 0 ? `
                  <div class="appointments-list">
                    ${patientAppointments.slice(0, 5).map(appointment => {
                      const appointmentDate = new Date(appointment.date);
                      return `
                        <div class="appointment-item">
                          <div class="appointment-date">
                            <span class="date">${appointmentDate.toLocaleDateString('fr-FR')}</span>
                            <span class="time">${appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                          </div>
                          <div class="appointment-details">
                            <span class="type">${appointment.type || 'Consultation'}</span>
                            <span class="practitioner">${appointment.practitioner || 'Dr. Martin'}</span>
                          </div>
                          <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <div class="empty-state">
                    <i class="ri-calendar-line"></i>
                    <p>Aucun rendez-vous enregistré</p>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="history-tab">
            <div class="detail-sections">
              <div class="detail-section">
                <h3><i class="ri-history-line"></i> Historique complet</h3>
                <div class="history-timeline">
                  <div class="history-item">
                    <div class="history-date">
                      <span class="date">${createdDate}</span>
                    </div>
                    <div class="history-content">
                      <h4>Patient ajouté au système</h4>
                      <p>Inscription dans la base de données</p>
                    </div>
                  </div>
                  ${patientAppointments.map(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return `
                      <div class="history-item">
                        <div class="history-date">
                          <span class="date">${appointmentDate.toLocaleDateString('fr-FR')}</span>
                          <span class="time">${appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                        <div class="history-content">
                          <h4>${appointment.type || 'Consultation'}</h4>
                          <p>${appointment.practitioner || 'Dr. Martin'} - ${appointment.room || 'Salle non spécifiée'}</p>
                          ${appointment.notes ? `<p class="notes">${appointment.notes}</p>` : ''}
                        </div>
                        <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">
          <i class="ri-close-line"></i>
          Fermer
        </button>
        <button type="button" class="btn-primary" onclick="editPatient('${patient.id}'); closeModal();">
          <i class="ri-edit-line"></i>
          Modifier
        </button>
        <button type="button" class="btn-primary" onclick="createAppointmentForPatient('${patient.id}'); closeModal();">
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
  
  // Gestion des onglets
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      const tabName = btn.dataset.tab;
      
      // Désactiver tous les onglets
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Activer l'onglet sélectionné
      btn.classList.add('active');
      modal.querySelector(`#${tabName}-tab`).classList.add('active');
    };
  });
  
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
  
  return modal;
}

function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const patients = getPatients();
  
  let filteredPatients = patients.filter(patient => 
    (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm)) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm))
  );
  
  const patientsList = document.getElementById('patientsList');
  const searchResults = document.getElementById('searchResults');
  
  patientsList.innerHTML = filteredPatients.length > 0 ? 
    filteredPatients.map(patient => createPatientRow(patient)).join('') :
    createEmptyTableState();
    
  searchResults.textContent = `${filteredPatients.length} patient(s) trouvé(s)`;
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
