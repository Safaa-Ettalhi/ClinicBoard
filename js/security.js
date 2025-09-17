export function initSecurity(){
  const data = localStorage.getItem('clinicTest');
  if(!data){
    localStorage.setItem('clinicTest', JSON.stringify({
      passwordHash: null,
      failedAttempts: 0,
      lockoutUntil: null
    }));
  } else {
    const parsedData = JSON.parse(data);
    if(parsedData.failedAttempts === undefined) {
      parsedData.failedAttempts = 0;
    }
    if(parsedData.lockoutUntil === undefined) {
      parsedData.lockoutUntil = null;
    }
    localStorage.setItem('clinicTest', JSON.stringify(parsedData));
  }
}

export async function hashPassword(password){
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function checkPassword(password){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  const hash = await hashPassword(password);
  return hash === data.passwordHash;
}

export async function savePassword(password){
  const hash = await hashPassword(password);
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  data.passwordHash = hash;
  data.failedAttempts = 0;
  data.lockoutUntil = null;
  localStorage.setItem('clinicTest', JSON.stringify(data));
}

export function isLockedOut(){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  if(!data.lockoutUntil) return false;
  
  const now = Date.now();
  if(now < data.lockoutUntil){
    return true;
  } else {
    data.lockoutUntil = null;
    data.failedAttempts = 0;
    localStorage.setItem('clinicTest', JSON.stringify(data));
    return false;
  }
}

export function getLockoutTimeRemaining(){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  if(!data.lockoutUntil) return 0;
  
  const now = Date.now();
  const remaining = data.lockoutUntil - now;
  return Math.ceil(remaining / (1000 * 60));
}

export function handleFailedAttempt(){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  data.failedAttempts = (data.failedAttempts || 0) + 1;
  
  if(data.failedAttempts >= 3){
    data.lockoutUntil = Date.now() + (5 * 60 * 1000);
  }
  
  localStorage.setItem('clinicTest', JSON.stringify(data));
  return data.failedAttempts;
}

export function resetFailedAttempts(){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  data.failedAttempts = 0;
  data.lockoutUntil = null;
  localStorage.setItem('clinicTest', JSON.stringify(data));
}

export function getFailedAttempts(){
  const data = JSON.parse(localStorage.getItem('clinicTest'));
  return data.failedAttempts || 0;
}