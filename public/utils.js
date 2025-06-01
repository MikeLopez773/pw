// Funções utilitárias globais
function getToken() {
  return sessionStorage.getItem('token');
}

function setToken(token) {
  sessionStorage.setItem('token', token);
}

function removeToken() {
  sessionStorage.removeItem('token');
}

function showMessage(msg, type = 'success') {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = msg;
    el.className = type;
    setTimeout(() => { el.textContent = ''; el.className = ''; }, 4000);
  }
}

// Login
async function loginUser(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    setToken(data.token);
    // Redireciona para a página de MFA
    window.location.href = 'mfa.html';
  } else {
    showMessage(data.message || 'Erro no login', 'error');
  }
}

// Registar painel solar
async function registerPanel(location, capacity, installationDate) {
  const res = await fetch('/api/panels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ location, capacity: Number(capacity), installationDate })
  });
  const data = await res.json();
  if (res.ok) {
    showMessage('Painel registado!', 'success');
    loadPanels();
  } else {
    showMessage(data.message || 'Erro ao registar painel', 'error');
  }
}

// Listar painéis solares
async function loadPanels() {
  const res = await fetch('/api/panels', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (res.ok) {
    renderPanels(data);
  } else {
    showMessage('Erro ao carregar painéis', 'error');
  }
}

// Monitorizar produção de um painel
async function monitorPanel(panelId) {
  const res = await fetch(`/api/energy/${panelId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (res.ok) {
    showMessage('Produção registada: ' + data.data.production + ' kWh', 'success');
    loadProduction(panelId);
  } else {
    showMessage('Erro ao monitorizar produção', 'error');
  }
}

// Listar produção de um painel
async function loadProduction(panelId) {
  const res = await fetch(`/api/energy/history/${panelId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (res.ok) {
    renderProduction(data);
  } else {
    showMessage('Erro ao carregar produção', 'error');
  }
}

// Listar créditos
async function loadCredits() {
  const res = await fetch('/api/credits', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (res.ok) {
    renderCredits(data);
  } else {
    showMessage('Erro ao carregar créditos', 'error');
  }
}

// Alterar password
async function alterarPassword(userId, newPassword) {
  console.log('🔄 [FRONTEND] A tentar alterar password para userId:', userId, 'com nova password:', newPassword);
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken()
    },
    body: JSON.stringify({ userId, newPassword })
  });
  const data = await res.json();
  console.log('🔁 [FRONTEND] Resposta do backend:', data, 'Status:', res.status);
  if (res.ok) {
    showMessage('Password alterada com sucesso!', 'success');
    // Limpar o formulário se existir
    const form = document.getElementById('alterarPasswordForm');
    if (form) form.reset();
  } else {
    showMessage(data.message || 'Erro ao alterar password', 'error');
  }
}

// Renderizações e mensagens
function renderPanels(panels) {
  const el = document.getElementById('panelsTable');
  if (!el) return;
  el.innerHTML = panels.map(panel => `
    <tr>
      <td>${panel.location}</td>
      <td>${panel.capacity} kW</td>
      <td>${panel.validated ? 'Validado' : 'Pendente'}</td>
      <td>
        <button onclick="monitorPanel('${panel._id}')">Monitorizar</button>
        <button onclick="loadProduction('${panel._id}')">Histórico</button>
      </td>
    </tr>
  `).join('');
}

function renderProduction(records) {
  const el = document.getElementById('productionTable');
  if (!el) return;
  el.innerHTML = records.map(r => `
    <tr>
      <td>${new Date(r.timestamp).toLocaleString()}</td>
      <td>${r.production} kWh</td>
    </tr>
  `).join('');
}

function renderCredits(credits) {
  const el = document.getElementById('creditsTable');
  if (!el) return;
  el.innerHTML = credits.map(c => `
    <tr>
      <td>${c.month}</td>
      <td>${c.credits} kWh</td>
    </tr>
  `).join('');
}

// Eventos de formulários (exemplo)
document.addEventListener('DOMContentLoaded', () => {
  // Exemplo: associar eventos aos formulários se existirem
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = loginForm.username.value;
      const password = loginForm.password.value;
      loginUser(username, password);
    });
  }

  // Remover/comentar o evento do formulário de registo
  // const registerForm = document.getElementById('registerForm');
  // if (registerForm) {
  //   registerForm.addEventListener('submit', e => {
  //     e.preventDefault();
  //     const username = registerForm.username.value;
  //     const email = registerForm.email.value;
  //     const password = registerForm.password.value;
  //     registerUser(username, email, password);
  //   });
  // }

  const panelForm = document.getElementById('panelForm');
  if (panelForm) {
    panelForm.addEventListener('submit', e => {
      e.preventDefault();
      const location = panelForm.location.value;
      const capacity = panelForm.capacity.value;
      const installationDate = panelForm.installationDate.value;
      registerPanel(location, capacity, installationDate);
    });
    loadPanels();
    loadCredits();
  }

  const token = getToken();
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') {
      document.getElementById('createTechnicianForm').style.display = 'none';
    }
  }

  document.getElementById('createGestorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.username.value;
    const email = this.email.value;
    const password = this.password.value;
    const res = await fetch('/api/auth/create-gestor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    showMessage(data.message, res.ok ? 'success' : 'error');
  });

  const alterarPwForm = document.getElementById('alterarPasswordForm');
  if (alterarPwForm) {
    alterarPwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
      const userId = payload.id || payload._id || payload.userId;
      const newPassword = alterarPwForm.newPassword.value;
      console.log('🟢 [FRONTEND] Submissão do formulário:', { userId, newPassword });
      await alterarPassword(userId, newPassword);
    });
  }

  // Novo evento para gerar certificado
  document.getElementById('certificateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const panelId = e.target.panelId.value;
    console.log('📄 [FRONTEND] A gerar certificado para o painel:', panelId);
    const res = await fetch('/api/panels/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panelId })
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('Certificado gerado com sucesso!', 'success');
    } else {
      showMessage(data.message || 'Erro ao gerar certificado', 'error');
    }
  });
});