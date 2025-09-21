import { createNavigation, updateActiveNavItem } from './navigation.js';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment as removeAppointment, getPatients } from './storage.js';

export function showAppointments(root) {
  document.body.className = 'with-navigation';
  
  const appointments = getAppointments();
  const patients = getPatients();
  const today = new Date();
  const todayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date);
    return appointmentDate.toDateString() === today.toDateString();
  });
  
  const confirmedAppointments = appointments.filter(a => a.status === 'completed').length;
  const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;
  const urgentAppointments = appointments.filter(a => a.type === 'urgence').length;
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <div class="header-info">
          <h1 class="content-title">Agenda des Rendez-vous</h1>
          <p class="content-subtitle">Gérez vos consultations quotidiennes</p>
        </div>
        <button id="addAppointmentBtn" class="btn-primary">
          <i class="ri-add-line"></i>
          Nouveau RDV
        </button>
      </div>
      
      <div class="content-body">
        <div class="date-navigation-section">
          <div class="date-navigation">
            <button id="prevDay" class="btn-nav">
              <i class="ri-arrow-left-line"></i>
            </button>
            <div class="date-info">
            <span id="currentDate" class="current-date">${today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span class="appointments-count">${todayAppointments.length} rendez-vous programmés</span>
            </div>
            <button id="nextDay" class="btn-nav">
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
        
        <div class="filters-and-views">
        <div class="filters-section">
          <div class="filter-group">
              <label class="input-label">Praticien</label>
            <select id="practitionerFilter">
              <option value="">Tous les praticiens</option>
              <option value="Dr. Ahmed Benali">Dr. Ahmed Benali</option>
              <option value="Dr. Fatima Zahra">Dr. Fatima Zahra</option>
              <option value="Dr. Youssef Alami">Dr. Youssef Alami</option>
              <option value="Dr. Aicha Mansouri">Dr. Aicha Mansouri</option>
              <option value="Dr. Omar Tazi">Dr. Omar Tazi</option>
            </select>
          </div>
          <div class="filter-group">
              <label class="input-label">Statut</label>
            <select id="statusFilter">
              <option value="">Tous les statuts</option>
              <option value="scheduled">Programmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
        </div>
          
          <div class="view-controls">
            <div class="view-tabs">
              <button class="view-tab active" data-view="list">
                <i class="ri-list-check"></i>
                Liste
              </button>
              <button class="view-tab" data-view="agenda">
                <i class="ri-calendar-line"></i>
                Agenda
              </button>
            </div>
          </div>
        </div>
        
        <div class="appointment-stats">
          <div class="stat-card">
            <div class="stat-icon blue">
              <i class="ri-calendar-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${appointments.length}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon green">
              <i class="ri-check-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${confirmedAppointments}</div>
              <div class="stat-label">Confirmés</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon orange">
              <i class="ri-time-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${pendingAppointments}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon red">
              <i class="ri-alarm-warning-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${urgentAppointments}</div>
              <div class="stat-label">Urgences</div>
            </div>
          </div>
        </div>
        
        <div class="daily-planning-section">
          <div class="section-header">
            <h3>Planning du jour</h3>
            <p>Consultations et rendez-vous programmés</p>
        </div>
        
        <div class="appointments-container">
          <div class="appointments-list active" id="appointmentsList">
              ${todayAppointments.length > 0 ? 
                todayAppointments.map(appointment => createAppointmentCard(appointment, patients)).join('') :
              createEmptyAppointmentsState()
            }
          </div>
          
          <div class="agenda-view" id="agendaView">
            ${createAgendaView(appointments, patients, today)}
          </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('appointments');
  setupAppointmentsEventListeners();
}


function createAppointmentCard(appointment, patients) {
  const patient = patients.find(p => p.id === appointment.patientId);
  const appointmentDate = new Date(appointment.date);
  const timeString = appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
  const duration = appointment.duration || 30;
  
  return `
    <div class="appointment-card" data-appointment-id="${appointment.id}">
      <div class="appointment-time-section">
        <div class="time-display">${timeString}</div>
        <div class="duration-display">${duration}min</div>
      </div>
      
      <div class="appointment-content">
        <div class="patient-info">
        <h3 class="patient-name">${patient?.fullName || 'Patient inconnu'}</h3>
          <p class="appointment-type">${appointment.type || 'Consultation générale'}</p>
          <p class="patient-id">${patient?.id?.substring(0, 3) || 'N/A'}</p>
          </div>
        
        <div class="appointment-status">
          <div class="status-info">
            <i class="ri-time-line"></i>
            <span class="status-text">${getStatusText(appointment.status || 'scheduled')}</span>
          </div>
          ${patient?.phone ? `
            <div class="phone-info">
              <i class="ri-phone-line"></i>
              <span>${patient.phone}</span>
        </div>
          ` : ''}
        </div>
      </div>
      
      <div class="appointment-actions">
        <button class="action-btn phone-btn" onclick="callPatient('${patient?.phone || ''}')" title="Appeler">
          <i class="ri-phone-line"></i>
        </button>
        <button class="action-btn edit-btn" onclick="editAppointment('${appointment.id}')" title="Modifier">
          <i class="ri-edit-line"></i>
        </button>
        <button class="action-btn view-btn" onclick="viewAppointment('${appointment.id}')" title="Voir détails">
          <i class="ri-eye-line"></i>
        </button>
        <button class="action-btn delete-btn" onclick="handleDeleteAppointment('${appointment.id}')" title="Supprimer">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>
  `;
}

function createAgendaView(appointments, patients, selectedDate) {
  const dayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });
  
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        appointments: []
      });
    }
  }
  
  dayAppointments.forEach(appointment => {
    const appointmentTime = new Date(appointment.date);
    const startTime = appointmentTime.toTimeString().substring(0, 5);
    const slot = timeSlots.find(slot => slot.time === startTime);
    if (slot) {
      slot.appointments.push(appointment);
    }
  });
  
  return `
    <div class="agenda-timeline">
      <div class="agenda-header">
        <div class="time-column-header">Heure</div>
        <div class="appointments-column-header">Rendez-vous</div>
      </div>
      <div class="agenda-body">
      ${timeSlots.map(slot => `
          <div class="agenda-time-slot">
          <div class="time-label">${slot.time}</div>
          <div class="appointments-slot">
              ${slot.appointments.length > 0 ? 
                slot.appointments.map(appointment => {
              const patient = patients.find(p => p.id === appointment.patientId);
                  const appointmentDate = new Date(appointment.date);
                  const duration = appointment.duration || 30;
                  
              return `
                <div class="agenda-appointment ${appointment.status || 'scheduled'}" 
                     onclick="editAppointment('${appointment.id}')">
                      <div class="agenda-appointment-header">
                        <span class="agenda-time">${appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                        <span class="agenda-duration">${duration}min</span>
                      </div>
                  <div class="agenda-patient">${patient?.fullName || 'Patient inconnu'}</div>
                  <div class="agenda-type">${appointment.type || 'Consultation'}</div>
                      <div class="agenda-practitioner">${appointment.practitioner || 'Lamiaa Ricouch'}</div>
                      <div class="agenda-status">
                        <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
                      </div>
                </div>
              `;
                }).join('') :
                `<div class="empty-slot">Libre</div>`
              }
            </div>
          </div>
        `).join('')}
        </div>
    </div>
  `;
}

function createEmptyAppointmentsState() {
  return `
    <div class="empty-appointments-state">
      <div class="empty-icon">
        <i class="ri-calendar-line"></i>
      </div>
      <h3>Aucun rendez-vous aujourd'hui</h3>
      <p>Commencez par ajouter votre premier rendez-vous</p>
    </div>
  `;
}

function getStatusText(status) {
  const statusMap = {
    'scheduled': 'PROGRAMMÉ',
    'completed': 'TERMINÉ',
    'cancelled': 'ANNULÉ',
    'no-show': 'NO-SHOW'
  };
  return statusMap[status] || 'PROGRAMMÉ';
}

function setupAppointmentsEventListeners() {
  document.getElementById('addAppointmentBtn').onclick = showAddAppointmentModal;
  
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.onclick = () => switchView(tab.dataset.view);
  });
  
  
  window.editAppointment = editAppointment;
  window.handleDeleteAppointment = handleDeleteAppointment;
  window.viewAppointment = viewAppointment;
  window.callPatient = callPatient;
}


function switchView(view) {
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  document.getElementById('appointmentsList').classList.toggle('active', view === 'list');
  document.getElementById('agendaView').classList.toggle('active', view === 'agenda');
  
}





function showAddAppointmentModal() {
  const modal = createAppointmentModal();
  document.body.appendChild(modal);
}

function createAppointmentModal(appointment = null) {
  const isEdit = appointment !== null;
  const patients = getPatients();
  const appointmentDate = appointment ? new Date(appointment.date) : new Date();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="appointmentForm">
        <div class="input-group">
          <label class="input-label">Patient *</label>
          <select id="patientId" required>
            <option value="">Sélectionner un patient</option>
            ${patients.map(patient => 
              `<option value="${patient.id}" ${appointment?.patientId === patient.id ? 'selected' : ''}>
                ${patient.fullName || patient.name || 'Nom non renseigné'}
              </option>`
            ).join('')}
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Date et heure *</label>
          <input type="datetime-local" id="dateTime" 
                 value="${appointmentDate.toISOString().slice(0, 16)}" required>
        </div>
        <div class="input-group">
          <label class="input-label">Type de consultation</label>
          <select id="type">
            <option value="consultation" ${appointment?.type === 'consultation' ? 'selected' : ''}>Consultation</option>
            <option value="suivi" ${appointment?.type === 'suivi' ? 'selected' : ''}>Suivi</option>
            <option value="urgence" ${appointment?.type === 'urgence' ? 'selected' : ''}>Urgence</option>
            <option value="controle" ${appointment?.type === 'controle' ? 'selected' : ''}>Contrôle</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Praticien</label>
          <select id="practitioner">
            <option value="Dr. Ahmed Benali" ${appointment?.practitioner === 'Dr. Ahmed Benali' ? 'selected' : ''}>Dr. Ahmed Benali</option>
            <option value="Dr. Fatima Zahra" ${appointment?.practitioner === 'Dr. Fatima Zahra' ? 'selected' : ''}>Dr. Fatima Zahra</option>
            <option value="Dr. Youssef Alami" ${appointment?.practitioner === 'Dr. Youssef Alami' ? 'selected' : ''}>Dr. Youssef Alami</option>
            <option value="Dr. Aicha Mansouri" ${appointment?.practitioner === 'Dr. Aicha Mansouri' ? 'selected' : ''}>Dr. Aicha Mansouri</option>
            <option value="Dr. Omar Tazi" ${appointment?.practitioner === 'Dr. Omar Tazi' ? 'selected' : ''}>Dr. Omar Tazi</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Salle</label>
          <input type="text" id="room" value="${appointment?.room || ''}" placeholder="Ex: Salle 1">
        </div>
        <div class="input-group">
          <label class="input-label">Durée</label>
          <select id="duration">
            <option value="15" ${appointment?.duration === 15 ? 'selected' : ''}>15 minutes</option>
            <option value="30" ${appointment?.duration === 30 ? 'selected' : ''}>30 minutes</option>
            <option value="45" ${appointment?.duration === 45 ? 'selected' : ''}>45 minutes</option>
            <option value="60" ${appointment?.duration === 60 ? 'selected' : ''}>1 heure</option>
            <option value="90" ${appointment?.duration === 90 ? 'selected' : ''}>1h30</option>
            <option value="120" ${appointment?.duration === 120 ? 'selected' : ''}>2 heures</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Statut</label>
          <select id="status">
            <option value="scheduled" ${appointment?.status === 'scheduled' ? 'selected' : ''}>Programmé</option>
            <option value="completed" ${appointment?.status === 'completed' ? 'selected' : ''}>Terminé</option>
            <option value="cancelled" ${appointment?.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
            <option value="no-show" ${appointment?.status === 'no-show' ? 'selected' : ''}>No-show</option>
          </select>
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
  
  modal.querySelector('#appointmentForm').onsubmit = (e) => {
    e.preventDefault();
    handleAppointmentSubmit(appointment?.id);
  };
  
  window.closeModal = closeModal;
  
  return modal;
}

function handleAppointmentSubmit(appointmentId) {
  const patientId = document.getElementById('patientId').value;
  const patients = getPatients();
  const selectedPatient = patients.find(p => p.id === patientId);
  
  const formData = {
    patientId: patientId,
    patientName: selectedPatient ? (selectedPatient.fullName || selectedPatient.name || 'Nom non renseigné') : 'Patient inconnu',
    date: document.getElementById('dateTime').value,
    type: document.getElementById('type').value,
    practitioner: document.getElementById('practitioner').value,
    room: document.getElementById('room').value,
    duration: parseInt(document.getElementById('duration').value),
    status: document.getElementById('status').value
  };
  
  if (!formData.patientId) {
    alert('Veuillez sélectionner un patient');
    return;
  }
  
  if (appointmentId) {
    updateAppointment(appointmentId, formData);
  } else {
    addAppointment(formData);
  }
  
  window.closeModal();
  showAppointments(document.getElementById('root'));
}

function editAppointment(appointmentId) {
  const appointments = getAppointments();
  const appointment = appointments.find(a => a.id === appointmentId);
  if (appointment) {
    const modal = createEditAppointmentModal(appointment);
    document.body.appendChild(modal);
  }
}

function createEditAppointmentModal(appointment) {
  const appointmentDate = new Date(appointment.date);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Modifier le rendez-vous</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="editAppointmentForm">
        <div class="input-group">
          <label class="input-label">Patient</label>
          <input type="text" value="${appointment.patientName}" readonly class="readonly-field">
        </div>
        <div class="input-group">
          <label class="input-label">Date et heure *</label>
          <input type="datetime-local" id="dateTime" 
                 value="${appointmentDate.toISOString().slice(0, 16)}" required>
        </div>
        <div class="input-group">
          <label class="input-label">Durée</label>
          <select id="duration">
            <option value="15" ${appointment.duration === 15 ? 'selected' : ''}>15 minutes</option>
            <option value="30" ${appointment.duration === 30 ? 'selected' : ''}>30 minutes</option>
            <option value="45" ${appointment.duration === 45 ? 'selected' : ''}>45 minutes</option>
            <option value="60" ${appointment.duration === 60 ? 'selected' : ''}>1 heure</option>
            <option value="90" ${appointment.duration === 90 ? 'selected' : ''}>1h30</option>
            <option value="120" ${appointment.duration === 120 ? 'selected' : ''}>2 heures</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Statut</label>
          <select id="status">
            <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Programmé</option>
            <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Terminé</option>
            <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
            <option value="no-show" ${appointment.status === 'no-show' ? 'selected' : ''}>No-show</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeEditModal()">Annuler</button>
          <button type="submit" class="btn-primary">Modifier</button>
        </div>
      </form>
    </div>
  `;
  
  const closeEditModal = () => {
    document.body.removeChild(modal);
    delete window.closeEditModal;
  };
  
  modal.querySelector('.modal-close').onclick = closeEditModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeEditModal();
  };
  
  modal.querySelector('#editAppointmentForm').onsubmit = (e) => {
    e.preventDefault();
    handleEditAppointmentSubmit(appointment.id);
  };
  
  window.closeEditModal = closeEditModal;
  
  return modal;
}

function handleEditAppointmentSubmit(appointmentId) {
  const dateTime = document.getElementById('dateTime').value;
  const duration = parseInt(document.getElementById('duration').value);
  const status = document.getElementById('status').value;
  
  if (!dateTime) {
    return;
  }
  
  const updates = {
    date: new Date(dateTime).toISOString(),
    duration: duration,
    status: status
  };
  
  const updatedAppointment = updateAppointment(appointmentId, updates);
  
  if (updatedAppointment) {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      document.body.removeChild(modal);
    }
    
    showAppointments(document.getElementById('root'));
  }
}

function handleDeleteAppointment(appointmentId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
    removeAppointment(appointmentId);
    showAppointments(document.getElementById('root'));
  }
}




function viewAppointment(appointmentId) {
  const appointments = getAppointments();
  const patients = getPatients();
  const appointment = appointments.find(a => a.id === appointmentId);
  
  if (appointment) {
    const patient = patients.find(p => p.id === appointment.patientId);
    const appointmentDate = new Date(appointment.date);
    const endTime = new Date(appointmentDate.getTime() + (appointment.duration || 30) * 60000);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content appointment-details-modal">
        <div class="modal-header">
          <div class="appointment-header-info">
            <div class="appointment-icon">
              <i class="ri-calendar-check-line"></i>
            </div>
            <div class="appointment-header-details">
              <h2>Détails du rendez-vous</h2>
              <p class="appointment-id">ID: ${appointment.id.substring(0, 8).toUpperCase()}</p>
              <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
            </div>
          </div>
          <button class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="appointment-details-tabs">
            <div class="tab-buttons">
              <button class="tab-btn active" data-tab="info">Informations</button>
              <button class="tab-btn" data-tab="patient">Patient</button>
              <button class="tab-btn" data-tab="medical">Médical</button>
              <button class="tab-btn" data-tab="history">Historique</button>
            </div>
            
            <div class="tab-content active" id="info-tab">
              <div class="detail-sections">
                <div class="detail-section">
                  <h3><i class="ri-calendar-line"></i> Informations du rendez-vous</h3>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>Date</label>
                      <span>${appointmentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="detail-item">
                      <label>Heure de début</label>
                      <span class="time-display">${appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div class="detail-item">
                      <label>Heure de fin</label>
                      <span class="time-display">${endTime.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div class="detail-item">
                      <label>Durée</label>
                      <span>${appointment.duration || 30} minutes</span>
                    </div>
                    <div class="detail-item">
                      <label>Type de consultation</label>
                      <span>${appointment.type || 'Consultation générale'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Praticien</label>
                      <span>${appointment.practitioner || 'Dr. Ahmed Benali'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Salle</label>
                      <span>${appointment.room || 'Non spécifiée'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Statut</label>
                      <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
                    </div>
                  </div>
                </div>
                
                ${appointment.notes ? `
                  <div class="detail-section">
                    <h3><i class="ri-file-text-line"></i> Notes du rendez-vous</h3>
                    <div class="notes-content">
                      <p>${appointment.notes}</p>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="tab-content" id="patient-tab">
              <div class="detail-sections">
                <div class="detail-section">
                  <h3><i class="ri-user-line"></i> Informations du patient</h3>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>Nom complet</label>
                      <span>${patient?.fullName || 'Patient inconnu'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Âge</label>
                      <span>${patient?.age || 0} ans</span>
                    </div>
                    <div class="detail-item">
                      <label>Téléphone</label>
                      <span>${patient?.phone || 'Non renseigné'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Email</label>
                      <span>${patient?.email || 'Non renseigné'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Groupe sanguin</label>
                      <span class="blood-group">${patient?.bloodGroup || 'Non spécifié'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Statut patient</label>
                      <span class="status-badge ${patient?.status || 'active'}">${patient?.status === 'active' ? 'ACTIF' : 'INACTIF'}</span>
                    </div>
                  </div>
                </div>
                
                ${patient?.notes ? `
                  <div class="detail-section">
                    <h3><i class="ri-file-text-line"></i> Notes du patient</h3>
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
                      <label>Allergies</label>
                      <span>${patient?.allergies || 'Aucune connue'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Médicaments actuels</label>
                      <span>${patient?.medications || 'Aucun'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Antécédents médicaux</label>
                      <span>${patient?.medicalHistory || 'Aucun'}</span>
                    </div>
                    <div class="detail-item">
                      <label>Dernière visite</label>
                      <span>${patient?.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Jamais'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="tab-content" id="history-tab">
              <div class="detail-sections">
                <div class="detail-section">
                  <h3><i class="ri-history-line"></i> Historique des rendez-vous</h3>
                  <div class="appointment-history">
                    ${patient ? getPatientAppointmentHistory(patient.id, appointments) : '<p>Aucun historique disponible</p>'}
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
          <button type="button" class="btn-primary" onclick="callPatient('${patient?.phone || ''}'); closeModal();">
            <i class="ri-phone-line"></i>
            Appeler
          </button>
          <button type="button" class="btn-primary" onclick="editAppointment('${appointment.id}'); closeModal();">
            <i class="ri-edit-line"></i>
            Modifier
          </button>
        </div>
      </div>
    `;
    
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        modal.querySelector(`#${tabId}-tab`).classList.add('active');
      });
    });
    
    const closeModal = () => {
      document.body.removeChild(modal);
      delete window.closeModal;
    };
    
    modal.querySelector('.modal-close').onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    
    window.closeModal = closeModal;
    document.body.appendChild(modal);
  }
}

function getPatientAppointmentHistory(patientId, appointments) {
  const patientAppointments = appointments
    .filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
  
  if (patientAppointments.length === 0) {
    return '<p class="no-history">Aucun rendez-vous précédent</p>';
  }
  
  return `
    <div class="history-timeline">
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
              <p>${appointment.practitioner || 'Dr. Ahmed Benali'} - ${appointment.room || 'Salle non spécifiée'}</p>
              ${appointment.notes ? `<p class="notes">${appointment.notes}</p>` : ''}
            </div>
            <span class="status-badge ${appointment.status || 'scheduled'}">${getStatusText(appointment.status || 'scheduled')}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function callPatient(phoneNumber) {
  if (phoneNumber) {
    window.open(`tel:${phoneNumber}`, '_self');
  } else {
    alert('Numéro de téléphone non disponible');
  }
}



