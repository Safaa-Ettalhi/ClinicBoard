import { getData, setData } from './storage.js';

export function initSecurity(){
  getData();
}

export async function hashPassword(password){
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function checkPassword(password){
  const data = getData();
  const hash = await hashPassword(password);
  return hash === data.auth.passwordHash;
}

export async function savePassword(password){
  const hash = await hashPassword(password);
  const data = getData();
  data.auth.passwordHash = hash;
  data.auth.failedAttempts = 0;
  data.auth.lockoutUntil = null;
  setData(data);
}

export function isLockedOut(){
  const data = getData();
  if(!data.auth.lockoutUntil) return false;
  
  const now = Date.now();
  if(now < data.auth.lockoutUntil){
    return true;
  } else {
    data.auth.lockoutUntil = null;
    data.auth.failedAttempts = 0;
    setData(data);
    return false;
  }
}

export function getLockoutTimeRemaining(){
  const data = getData();
  if(!data.auth.lockoutUntil) return 0;
  
  const now = Date.now();
  const remaining = data.auth.lockoutUntil - now;
  return Math.ceil(remaining / (1000 * 60));
}

export function handleFailedAttempt(){
  const data = getData();
  data.auth.failedAttempts = (data.auth.failedAttempts || 0) + 1;
  
  if(data.auth.failedAttempts >= 3){
    data.auth.lockoutUntil = Date.now() + (5 * 60 * 1000);
  }
  
  setData(data);
  return data.auth.failedAttempts;
}

export function resetFailedAttempts(){
  const data = getData();
  data.auth.failedAttempts = 0;
  data.auth.lockoutUntil = null;
  setData(data);
}

export function getFailedAttempts(){
  const data = getData();
  return data.auth.failedAttempts || 0;
}