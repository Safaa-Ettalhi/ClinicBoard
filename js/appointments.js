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
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <div class="header-info">
          <h1 class="content-title">Rendez-vous</h1>
          <p class="content-subtitle">Planification et gestion des rendez-vous</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <i class="ri-calendar-line"></i>
            <span>${appointments.length} RDV</span>
          </div>
          <div class="stat-badge today">
            <i class="ri-calendar-check-line"></i>
            <span>${todayAppointments.length} aujourd'hui</span>
          </div>
        </div>
        <button id="addAppointmentBtn" class="btn-primary">
          <i class="ri-calendar-add-line"></i>
          Nouveau Rendez-vous
        </button>
      </div>
      
      <div class="content-body">
        <div class="view-controls">
          <div class="view-tabs">
            <button class="view-tab active" data-view="list">Liste</button>
            <button class="view-tab" data-view="agenda">Agenda</button>
          </div>
          <div class="date-navigation">
            <button id="prevDay" class="btn-nav">
              <i class="ri-arrow-left-line"></i>
            </button>
            <span id="currentDate" class="current-date">${today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <button id="nextDay" class="btn-nav">
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
        
        <div class="filters-section">
          <div class="filter-group">
            <label class="input-label">Filtrer par praticien</label>
            <select id="practitionerFilter">
              <option value="">Tous les praticiens</option>
              <option value="Dr. Martin">Dr. Martin</option>
              <option value="Dr. Dupont">Dr. Dupont</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="input-label">Filtrer par statut</label>
            <select id="statusFilter">
              <option value="">Tous les statuts</option>
              <option value="scheduled">Programmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
        </div>
        
        <div class="appointments-container">
          <div class="appointments-list active" id="appointmentsList">
            ${appointments.length > 0 ? 
              appointments.map(appointment => createAppointmentCard(appointment, patients)).join('') :
              createEmptyAppointmentsState()
            }
          </div>
          
          <div class="agenda-view" id="agendaView">
            ${createAgendaView(appointments, patients, today)}
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
  const isToday = appointmentDate.toDateString() === new Date().toDateString();
  const isPast = appointmentDate < new Date();
  
  return `
    <div class="appointment-card ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}" data-appointment-id="${appointment.id}">
      <div class="appointment-time">
        <div class="time-display">
          ${appointmentDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
        </div>
        <div class="date-display">
          ${appointmentDate.toLocaleDateString('fr-FR')}
        </div>
        ${isToday ? '<div class="today-badge">Aujourd\'hui</div>' : ''}
      </div>
      <div class="appointment-info">
        <h3 class="patient-name">${patient?.fullName || 'Patient inconnu'}</h3>
        <div class="appointment-details">
          <div class="detail-item">
            <i class="ri-stethoscope-line"></i>
            <span>${appointment.type || 'Consultation'}</span>
          </div>
          <div class="detail-item">
            <i class="ri-user-line"></i>
            <span>${appointment.practitioner || 'Dr. Martin'}</span>
          </div>
          <div class="detail-item">
            <i class="ri-building-line"></i>
            <span>Salle: ${appointment.room || 'Non spécifiée'}</span>
          </div>
          <div class="detail-item">
            <i class="ri-time-line"></i>
            <span>${appointment.duration || 30} min</span>
          </div>
        </div>
      </div>
      <div class="appointment-status">
        <div class="status-badge ${appointment.status || 'scheduled'}">
          ${getStatusText(appointment.status || 'scheduled')}
        </div>
      </div>
      <div class="appointment-actions">
        <button class="btn-action btn-edit" onclick="editAppointment('${appointment.id}')" title="Modifier">
          <i class="ri-edit-line"></i>
        </button>
        <button class="btn-action btn-delete" onclick="handleDeleteAppointment('${appointment.id}')" title="Supprimer">
          <i class="ri-delete-bin-line"></i>
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
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        appointments: []
      });
    }
  }
  
  dayAppointments.forEach(appointment => {
    const appointmentTime = new Date(appointment.date);
    const timeString = appointmentTime.toTimeString().substring(0, 5);
    const slot = timeSlots.find(slot => slot.time === timeString);
    if (slot) {
      slot.appointments.push(appointment);
    }
  });
  
  return `
    <div class="agenda-grid">
      ${timeSlots.map(slot => `
        <div class="time-slot">
          <div class="time-label">${slot.time}</div>
          <div class="appointments-slot">
            ${slot.appointments.map(appointment => {
              const patient = patients.find(p => p.id === appointment.patientId);
              return `
                <div class="agenda-appointment ${appointment.status || 'scheduled'}" 
                     onclick="editAppointment('${appointment.id}')">
                  <div class="agenda-patient">${patient?.fullName || 'Patient inconnu'}</div>
                  <div class="agenda-type">${appointment.type || 'Consultation'}</div>
                  <div class="agenda-practitioner">${appointment.practitioner || 'Dr. Martin'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function createEmptyAppointmentsState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="ri-calendar-line"></i>
      </div>
      <h3>Aucun rendez-vous programmé</h3>
      <p>Commencez par planifier votre premier rendez-vous</p>
      <button class="btn-primary" onclick="document.getElementById('addAppointmentBtn').click()">
        <i class="ri-calendar-add-line"></i>
        Planifier un rendez-vous
      </button>
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
  
  document.getElementById('prevDay').onclick = () => navigateDate(-1);
  document.getElementById('nextDay').onclick = () => navigateDate(1);
  
  document.getElementById('practitionerFilter').onchange = handleFilter;
  document.getElementById('statusFilter').onchange = handleFilter;
  
  window.editAppointment = editAppointment;
  window.handleDeleteAppointment = handleDeleteAppointment;
}

let currentDate = new Date();

function switchView(view) {
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  document.getElementById('appointmentsList').classList.toggle('active', view === 'list');
  document.getElementById('agendaView').classList.toggle('active', view === 'agenda');
  
  if (view === 'agenda') {
    updateAgendaView();
  }
}


function updateDateDisplay() {
  document.getElementById('currentDate').textContent = 
    currentDate.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
}

function updateAgendaView() {
  const appointments = getAppointments();
  const patients = getPatients();
  document.getElementById('agendaView').innerHTML = createAgendaView(appointments, patients, currentDate);
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
                ${patient.fullName}
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
            <option value="Dr. Martin" ${appointment?.practitioner === 'Dr. Martin' ? 'selected' : ''}>Dr. Martin</option>
            <option value="Dr. Dupont" ${appointment?.practitioner === 'Dr. Dupont' ? 'selected' : ''}>Dr. Dupont</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Salle</label>
          <input type="text" id="room" value="${appointment?.room || ''}" placeholder="Ex: Salle 1">
        </div>
        <div class="input-group">
          <label class="input-label">Durée (minutes)</label>
          <input type="number" id="duration" value="${appointment?.duration || 30}" min="15" max="120" step="15">
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
  const formData = {
    patientId: document.getElementById('patientId').value,
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
    const modal = createAppointmentModal(appointment);
    document.body.appendChild(modal);
  }
}

function handleDeleteAppointment(appointmentId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
    removeAppointment(appointmentId);
    showAppointments(document.getElementById('root'));
  }
}

function navigateDate(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  updateDateDisplay();
  updateAgendaView();
}


function handleFilter() {
  const practitionerFilter = document.getElementById('practitionerFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const appointments = getAppointments();
  const patients = getPatients();

  let filteredAppointments = appointments;

  if (practitionerFilter) {
    filteredAppointments = filteredAppointments.filter(a => a.practitioner === practitionerFilter);
  }

  if (statusFilter) {
    filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter);
  }

  const appointmentsList = document.getElementById('appointmentsList');
  if (appointmentsList) {
    appointmentsList.innerHTML = filteredAppointments.length > 0 ? 
      filteredAppointments.map(appointment => createAppointmentCard(appointment, patients)).join('') :
      createEmptyAppointmentsState();
  }
}



