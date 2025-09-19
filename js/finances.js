import { createNavigation, updateActiveNavItem } from './navigation.js';
import { getRevenues, addRevenue, getExpenses, addExpense } from './storage.js';

export function showFinances(root) {
  document.body.className = 'with-navigation';
  
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
  
  const monthlyGoal = 5000;
  const goalProgress = Math.min((totalRevenues / monthlyGoal) * 100, 100);
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const lastMonthRevenues = revenues.filter(r => {
    const revenueDate = new Date(r.date);
    return revenueDate.getMonth() === lastMonth.getMonth() && 
           revenueDate.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const lastMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === lastMonth.getMonth() && 
           expenseDate.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const revenueTrend = lastMonthRevenues > 0 ? 
    ((totalRevenues - lastMonthRevenues) / lastMonthRevenues) * 100 : 0;
  const expenseTrend = lastMonthExpenses > 0 ? 
    ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
  
  root.innerHTML = `
    ${createNavigation()}
    <div class="main-content">
      <div class="content-header">
        <div class="header-info">
          <h1 class="content-title">Finances</h1>
          <p class="content-subtitle">Gestion financière du cabinet</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <i class="ri-money-dollar-box-line"></i>
            <span>${revenues.length} recettes</span>
          </div>
          <div class="stat-badge">
            <i class="ri-money-euro-box-line"></i>
            <span>${expenses.length} dépenses</span>
          </div>
        </div>
        <div class="header-actions">
          <button id="addRevenueBtn" class="btn-primary">
            <i class="ri-money-dollar-box-line"></i>
            Ajouter Recette
          </button>
          <button id="addExpenseBtn" class="btn-secondary">
            <i class="ri-money-euro-box-line"></i>
            Ajouter Dépense
          </button>
        </div>
      </div>
      
      <div class="content-body">
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon green">
              <i class="ri-money-dollar-box-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Recettes du mois</h3>
              <p class="stat-value">${totalRevenues.toFixed(2)} €</p>
              <p class="stat-subtitle">${monthlyRevenues.length} transactions</p>
              ${revenueTrend !== 0 ? `
                <p class="stat-trend ${revenueTrend > 0 ? 'positive' : 'negative'}">
                  <i class="ri-arrow-${revenueTrend > 0 ? 'up' : 'down'}-line"></i>
                  ${Math.abs(revenueTrend).toFixed(1)}% vs mois dernier
                </p>
              ` : ''}
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon red">
              <i class="ri-money-euro-box-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Dépenses du mois</h3>
              <p class="stat-value">${totalExpenses.toFixed(2)} €</p>
              <p class="stat-subtitle">${monthlyExpenses.length} transactions</p>
              ${expenseTrend !== 0 ? `
                <p class="stat-trend ${expenseTrend > 0 ? 'negative' : 'positive'}">
                  <i class="ri-arrow-${expenseTrend > 0 ? 'up' : 'down'}-line"></i>
                  ${Math.abs(expenseTrend).toFixed(1)}% vs mois dernier
                </p>
              ` : ''}
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon ${margin >= 0 ? 'green' : 'red'}">
              <i class="ri-line-chart-line"></i>
            </div>
            <div class="stat-info">
              <h3 class="stat-title">Marge du mois</h3>
              <p class="stat-value">${margin.toFixed(2)} €</p>
              <p class="stat-subtitle">${margin >= 0 ? 'Bénéfice' : 'Déficit'}</p>
            </div>
          </div>
        </div>
        
        <div class="budget-section">
          <div class="budget-header">
            <h3>Objectif mensuel</h3>
            <div class="budget-amount">${monthlyGoal.toFixed(2)} €</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${goalProgress}%"></div>
          </div>
          <div class="progress-info">
            <span>${totalRevenues.toFixed(2)} € / ${monthlyGoal.toFixed(2)} €</span>
            <span class="progress-percentage">${goalProgress.toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="tabs-section">
          <div class="tabs-header">
            <button class="tab-button active" data-tab="revenues">Recettes</button>
            <button class="tab-button" data-tab="expenses">Dépenses</button>
            <button class="tab-button" data-tab="analytics">Analyses</button>
          </div>
          
          <div class="tab-content active" id="revenues-tab">
            <div class="transactions-list" id="revenuesList">
              ${revenues.length > 0 ? 
                revenues.map(revenue => createRevenueCard(revenue)).join('') :
                createEmptyFinancesState('recettes', 'ri-money-dollar-box-line')
              }
            </div>
          </div>
          
          <div class="tab-content" id="expenses-tab">
            <div class="transactions-list" id="expensesList">
              ${expenses.length > 0 ? 
                expenses.map(expense => createExpenseCard(expense)).join('') :
                createEmptyFinancesState('dépenses', 'ri-money-euro-box-line')
              }
            </div>
          </div>
          
          <div class="tab-content" id="analytics-tab">
            ${createAnalyticsView(revenues, expenses)}
          </div>
        </div>
      </div>
    </div>
  `;
  
  updateActiveNavItem('finances');
  setupFinancesEventListeners();
}

function createRevenueCard(revenue) {
  const revenueDate = new Date(revenue.date);
  
  return `
    <div class="transaction-card revenue">
      <div class="transaction-icon">
        <i class="ri-money-dollar-box-line"></i>
      </div>
      <div class="transaction-info">
        <h3 class="transaction-label">${revenue.label || 'Recette'}</h3>
        <p class="transaction-method">${revenue.paymentMethod || 'Non spécifié'}</p>
        <p class="transaction-date">${revenueDate.toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="transaction-amount positive">
        +${revenue.amount.toFixed(2)} €
      </div>
    </div>
  `;
}

function createExpenseCard(expense) {
  const expenseDate = new Date(expense.date);
  
  return `
    <div class="transaction-card expense">
      <div class="transaction-icon">
        <i class="ri-money-euro-box-line"></i>
      </div>
      <div class="transaction-info">
        <h3 class="transaction-label">${expense.label || 'Dépense'}</h3>
        <p class="transaction-category">${expense.category || 'Non spécifié'}</p>
        <p class="transaction-date">${expenseDate.toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="transaction-amount negative">
        -${expense.amount.toFixed(2)} €
      </div>
    </div>
  `;
}

function createEmptyFinancesState(type, icon) {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="${icon}"></i>
      </div>
      <h3>Aucune ${type} enregistrée</h3>
      <p>Commencez par enregistrer votre première ${type}</p>
      <button class="btn-primary" onclick="document.getElementById('add${type === 'recettes' ? 'Revenue' : 'Expense'}Btn').click()">
        <i class="${icon}"></i>
        Ajouter une ${type}
      </button>
    </div>
  `;
}

function createAnalyticsView(revenues, expenses) {
  const expensesByCategory = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Autre';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
  });
  
  const revenuesByMethod = {};
  revenues.forEach(revenue => {
    const method = revenue.paymentMethod || 'Non spécifié';
    revenuesByMethod[method] = (revenuesByMethod[method] || 0) + revenue.amount;
  });
  
  return `
    <div class="analytics-content">
      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>Dépenses par catégorie</h3>
          <div class="category-list">
            ${Object.entries(expensesByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => `
                <div class="category-item">
                  <span class="category-name">${category}</span>
                  <span class="category-amount">${amount.toFixed(2)} €</span>
                </div>
              `).join('')}
          </div>
        </div>
        
        <div class="analytics-card">
          <h3>Recettes par méthode de paiement</h3>
          <div class="method-list">
            ${Object.entries(revenuesByMethod)
              .sort(([,a], [,b]) => b - a)
              .map(([method, amount]) => `
                <div class="method-item">
                  <span class="method-name">${method}</span>
                  <span class="method-amount">${amount.toFixed(2)} €</span>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupFinancesEventListeners() {
  document.getElementById('addRevenueBtn').onclick = showAddRevenueModal;
  document.getElementById('addExpenseBtn').onclick = showAddExpenseModal;
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.onclick = () => switchTab(button.dataset.tab);
  });
}

function showAddRevenueModal() {
  const modal = createRevenueModal();
  document.body.appendChild(modal);
}

function showAddExpenseModal() {
  const modal = createExpenseModal();
  document.body.appendChild(modal);
}

function createRevenueModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nouvelle Recette</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="revenueForm">
        <div class="input-group">
          <label class="input-label">Montant *</label>
          <input type="number" id="amount" step="0.01" min="0" required>
        </div>
        <div class="input-group">
          <label class="input-label">Libellé</label>
          <input type="text" id="label" placeholder="Ex: Consultation Dr. Martin">
        </div>
        <div class="input-group">
          <label class="input-label">Méthode de paiement</label>
          <select id="paymentMethod">
            <option value="especes">Espèces</option>
            <option value="carte">Carte bancaire</option>
            <option value="cheque">Chèque</option>
            <option value="virement">Virement</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Date</label>
          <input type="date" id="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
          <button type="submit" class="btn-primary">Ajouter</button>
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
  
  modal.querySelector('#revenueForm').onsubmit = (e) => {
    e.preventDefault();
    handleRevenueSubmit();
  };
  
  window.closeModal = closeModal;
  
  return modal;
}

function createExpenseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nouvelle Dépense</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="expenseForm">
        <div class="input-group">
          <label class="input-label">Montant *</label>
          <input type="number" id="amount" step="0.01" min="0" required>
        </div>
        <div class="input-group">
          <label class="input-label">Libellé</label>
          <input type="text" id="label" placeholder="Ex: Fournitures médicales">
        </div>
        <div class="input-group">
          <label class="input-label">Catégorie</label>
          <select id="category">
            <option value="fournitures">Fournitures médicales</option>
            <option value="loyer">Loyer</option>
            <option value="electricite">Électricité</option>
            <option value="telephone">Téléphone</option>
            <option value="assurance">Assurance</option>
            <option value="formation">Formation</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Date</label>
          <input type="date" id="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
          <button type="submit" class="btn-primary">Ajouter</button>
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
  
  modal.querySelector('#expenseForm').onsubmit = (e) => {
    e.preventDefault();
    handleExpenseSubmit();
  };
  
  window.closeModal = closeModal;
  
  return modal;
}

function handleRevenueSubmit() {
  const formData = {
    amount: parseFloat(document.getElementById('amount').value),
    label: document.getElementById('label').value.trim(),
    paymentMethod: document.getElementById('paymentMethod').value,
    date: document.getElementById('date').value
  };
  
  if (!formData.amount || formData.amount <= 0) {
    alert('Veuillez saisir un montant valide');
    return;
  }
  
  addRevenue(formData);
  window.closeModal();
  showFinances(document.getElementById('root'));
}

function handleExpenseSubmit() {
  const formData = {
    amount: parseFloat(document.getElementById('amount').value),
    label: document.getElementById('label').value.trim(),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };
  
  if (!formData.amount || formData.amount <= 0) {
    alert('Veuillez saisir un montant valide');
    return;
  }
  
  addExpense(formData);
  window.closeModal();
  showFinances(document.getElementById('root'));
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}
