const STORAGE_KEY = 'clinicApp:data';
const DEFAULT_DATA = {
  auth: {
    passwordHash: null,
    failedAttempts: 0,
    lockoutUntil: null
  },
  patients: [],
  appointments: [],
  cash: {
    revenues: [],
    expenses: []
  }
};

export function getData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    setData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
  
  const parsedData = JSON.parse(data);
  
  if (parsedData.passwordHash !== undefined) {
    const migratedData = {
      auth: {
        passwordHash: parsedData.passwordHash,
        failedAttempts: parsedData.failedAttempts || 0,
        lockoutUntil: parsedData.lockoutUntil || null
      },
      patients: parsedData.patients || [],
      appointments: parsedData.appointments || [],
      cash: {
        revenues: parsedData.cash?.revenues || [],
        expenses: parsedData.cash?.expenses || []
      }
    };
    setData(migratedData);
    return migratedData;
  }
  
  const completeData = {
    auth: parsedData.auth || DEFAULT_DATA.auth,
    patients: parsedData.patients || DEFAULT_DATA.patients,
    appointments: parsedData.appointments || DEFAULT_DATA.appointments,
    cash: {
      revenues: parsedData.cash?.revenues || DEFAULT_DATA.cash.revenues,
      expenses: parsedData.cash?.expenses || DEFAULT_DATA.cash.expenses
    }
  };
  
  return completeData;
}

export function setData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPatients() {
  const data = getData();
  const patients = data.patients || [];
  
  const migratedPatients = patients.map(patient => ({
    ...patient,
    fullName: patient.fullName || patient.name || 'Nom non renseigné',
    age: patient.age || 0,
    bloodGroup: patient.bloodGroup || '',
    lastVisit: patient.lastVisit || null,
    status: patient.status || 'active',
    allergies: patient.allergies || '',
    medications: patient.medications || '',
    medicalHistory: patient.medicalHistory || '',
    createdAt: patient.createdAt || new Date().toISOString()
  }));
  
  if (migratedPatients.some((patient, index) => patient !== patients[index])) {
    setPatients(migratedPatients);
  }
  
  return migratedPatients;
}

export function setPatients(patients) {
  const data = getData();
  data.patients = patients;
  setData(data);
}

export function addPatient(patient) {
  const patients = getPatients();
  const newPatient = {
    id: generateId(),
    ...patient,
    age: patient.age || 0,
    bloodGroup: patient.bloodGroup || '',
    lastVisit: patient.lastVisit || null,
    status: patient.status || 'active',
    allergies: patient.allergies || '',
    medications: patient.medications || '',
    medicalHistory: patient.medicalHistory || '',
    createdAt: new Date().toISOString()
  };
  patients.push(newPatient);
  setPatients(patients);
  return newPatient;
}

export function updatePatient(id, updates) {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() };
    setPatients(patients);
    return patients[index];
  }
  return null;
}

export function deletePatient(id) {
  const patients = getPatients();
  const filteredPatients = patients.filter(p => p.id !== id);
  setPatients(filteredPatients);
  
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(a => a.patientId !== id);
  setAppointments(filteredAppointments);
}

export function getAppointments() {
  const data = getData();
  const appointments = data.appointments || [];
  
  const migratedAppointments = appointments.map(appointment => {
    if (!appointment.patientName && appointment.patientId) {
      const patients = data.patients || [];
      const patient = patients.find(p => p.id === appointment.patientId);
      return {
        ...appointment,
        patientName: patient ? (patient.fullName || patient.name || 'Nom non renseigné') : 'Patient inconnu'
      };
    }
    return appointment;
  });
  
  if (migratedAppointments.some((appointment, index) => appointment !== appointments[index])) {
    setAppointments(migratedAppointments);
  }
  
  return migratedAppointments;
}

export function setAppointments(appointments) {
  const data = getData();
  data.appointments = appointments;
  setData(data);
}

export function addAppointment(appointment) {
  const appointments = getAppointments();
  const newAppointment = {
    id: generateId(),
    ...appointment,
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppointment);
  setAppointments(appointments);
  return newAppointment;
}

export function updateAppointment(id, updates) {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
    setAppointments(appointments);
    return appointments[index];
  }
  return null;
}

export function deleteAppointment(id) {
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(a => a.id !== id);
  setAppointments(filteredAppointments);
}

export function getRevenues() {
  const data = getData();
  return data.cash.revenues;
}

export function setRevenues(revenues) {
  const data = getData();
  data.cash.revenues = revenues;
  setData(data);
}

export function addRevenue(revenue) {
  const revenues = getRevenues();
  const newRevenue = {
    id: generateId(),
    ...revenue,
    createdAt: new Date().toISOString()
  };
  revenues.push(newRevenue);
  setRevenues(revenues);
  return newRevenue;
}

export function getExpenses() {
  const data = getData();
  return data.cash.expenses;
}

export function setExpenses(expenses) {
  const data = getData();
  data.cash.expenses = expenses;
  setData(data);
}

export function addExpense(expense) {
  const expenses = getExpenses();
  const newExpense = {
    id: generateId(),
    ...expense,
    createdAt: new Date().toISOString()
  };
  expenses.push(newExpense);
  setExpenses(expenses);
  return newExpense;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


export function getDashboardStats() {
  const patients = getPatients();
  const appointments = getAppointments();
  const revenues = getRevenues();
  const expenses = getExpenses();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyRevenues = revenues.filter(r => {
    const revenueDate = new Date(r.date);
    return revenueDate.getMonth() === currentMonth && revenueDate.getFullYear() === currentYear;
  });
  
  const monthlyExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const totalRevenues = monthlyRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const margin = totalRevenues - totalExpenses;
  
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date);
    return appointmentDate.toDateString() === today;
  });
  
  return {
    totalPatients: patients.length,
    totalAppointments: appointments.length,
    todayAppointments: todayAppointments,
    monthlyRevenues: totalRevenues,
    monthlyExpenses: totalExpenses,
    margin: margin
  };
}
