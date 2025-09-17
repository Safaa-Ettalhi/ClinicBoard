import { initRouter } from './js/router.js';
import { initSecurity } from './js/security.js';

initSecurity();  // initialise LocalStorage si nécessaire
initRouter();    // démarre le mini-router
