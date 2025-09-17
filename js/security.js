export function initSecurity(){
  const data = localStorage.getItem('clinicTest');
  if(!data){
    localStorage.setItem('clinicTest', JSON.stringify({passwordHash:null}));
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
  const data = {passwordHash: hash};
  localStorage.setItem('clinicTest', JSON.stringify(data));
}