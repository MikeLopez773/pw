// Adiciona esta função de debug melhorada no início do ficheiro
function debugTokenDetailed() {
  const token = sessionStorage.getItem('token');
  console.log('🔍 DEBUG COMPLETO DO TOKEN:');
  console.log('Raw token from sessionStorage:', token);
  console.log('Token type:', typeof token);
  console.log('Token length:', token ? token.length : 0);
  
  if (token) {
    console.log('Token starts with:', token.substring(0, 50));
    console.log('Token ends with:', token.substring(token.length - 50));
    
    const parts = token.split('.');
    console.log('Number of parts:', parts.length);
    console.log('Part 1 length:', parts[0] ? parts[0].length : 0);
    console.log('Part 2 length:', parts[1] ? parts[1].length : 0);
    console.log('Part 3 length:', parts[2] ? parts[2].length : 0);
    
    // Tenta decodificar cada parte
    parts.forEach((part, index) => {
      try {
        if (index < 2) { // Header e payload são base64url encoded
          const decoded = JSON.parse(atob(part));
          console.log(`Part ${index + 1} decoded:`, decoded);
        }
      } catch (e) {
        console.log(`❌ Error decoding part ${index + 1}:`, e.message);
      }
    });
  } else {
    console.log('❌ No token found in sessionStorage');
  }
}

// Chama esta função logo no início
debugTokenDetailed();

// Proteção de acesso: só clientes autenticados podem aceder
(function checkAuth() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '/login_web/login.html';
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'cliente') {
      window.location.href = '/login_web/login.html';
    }
  } catch {
    window.location.href = '/login_web/login.html';
  }
})();

// Função para debug do token
function debugToken() {
  const token = getToken();
  console.log('🎫 Token completo:', token);
  
  if (token) {
    try {
      const parts = token.split('.');
      console.log('🔍 Partes do token:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('📋 Payload decodificado:', payload);
        console.log('⏰ Token expira em:', new Date(payload.exp * 1000));
        console.log('🕐 Hora atual:', new Date());
      }
    } catch (e) {
      console.log('❌ Erro ao decodificar token:', e.message);
    }
  }
}

// Chama a função de debug ao carregar a página
debugToken();

// Utilitário para obter token JWT (CORRIGIDO)
function getToken() {
  const token = sessionStorage.getItem('token');
  // Remove qualquer "Bearer " que possa estar no início
  if (token && token.startsWith('Bearer ')) {
    return token.substring(7); // Remove "Bearer "
  }
  return token;
}

// Reset da password
const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
  resetForm.onsubmit = async (e) => {
    e.preventDefault();
    const oldPassword = resetForm.oldPassword.value;
    const newPassword = resetForm.newPassword.value;
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    const msg = document.getElementById('message');
    if (res.ok) {
      msg.style.color = "#388e3c";
      msg.textContent = "Password alterada com sucesso!";
      resetForm.reset();
    } else {
      msg.style.color = "#e53935";
      msg.textContent = data.message || "Erro ao alterar password.";
    }
  };
}

// Registar painel solar
const panelForm = document.getElementById('panelForm');
if (panelForm) {
  panelForm.onsubmit = async (e) => {
    e.preventDefault();
    const location = panelForm.location.value;
    const capacity = panelForm.capacity.value;
    const installationDate = panelForm.installationDate.value;
    const res = await fetch('/api/panels/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ location, capacity, installationDate })
    });
    const data = await res.json();
    const msg = document.getElementById('message');
    if (res.ok) {
      msg.style.color = "#388e3c";
      msg.textContent = "Painel registado com sucesso!";
      panelForm.reset();
    } else {
      msg.style.color = "#e53935";
      msg.textContent = data.message || "Erro ao registar painel.";
    }
  };
}

// Listar painéis solares
const panelsTable = document.getElementById('panelsTable');
if (panelsTable) {
  async function loadPanels() {
    console.log('🚀 Carregando painéis...');
    const token = getToken();
    console.log('🎫 Token para painéis:', token ? 'Presente' : 'Ausente');
    
    const res = await fetch('/api/panels', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📡 Resposta painéis:', res.status);
    
    if (res.ok) {
      const panels = await res.json();
      console.log('✅ Painéis carregados:', panels);
      panelsTable.innerHTML = panels.map(panel => `
        <tr>
          <td>${panel.location}</td>
          <td>${panel.capacity} kW</td>
          <td>${panel.validated ? 'Validado' : 'Pendente'}</td>
        </tr>
      `).join('');
    } else {
      const errorText = await res.text();
      console.log('❌ Erro ao carregar painéis:', errorText);
      panelsTable.innerHTML = '<tr><td colspan="3">Erro ao carregar painéis.</td></tr>';
    }
  }
  loadPanels();
}

// Histórico de produção
const productionTable = document.getElementById('productionTable');
if (productionTable) {
  async function loadProduction() {
    console.log('🚀 Carregando histórico de produção...');
    const token = getToken();
    console.log('🎫 Token para produção:', token ? 'Presente' : 'Ausente');
    
    const res = await fetch('/api/energy/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📡 Resposta produção:', res.status);
    
    if (res.ok) {
      const records = await res.json();
      console.log('✅ Histórico carregado:', records);
      productionTable.innerHTML = records.map(record => `
        <tr>
          <td>${new Date(record.date).toLocaleDateString()}</td>
          <td>${record.production} kWh</td>
        </tr>
      `).join('');
    } else {
      const errorText = await res.text();
      console.log('❌ Erro ao carregar produção:', errorText);
      productionTable.innerHTML = '<tr><td colspan="2">Erro ao carregar histórico.</td></tr>';
    }
  }
  loadProduction();
}

// Créditos de energia
const creditsTable = document.getElementById('creditsTable');
if (creditsTable) {
  async function loadCredits() {
    console.log('🚀 Carregando créditos...');
    const token = getToken();
    console.log('🎫 Token para créditos:', token ? 'Presente' : 'Ausente');
    
    const res = await fetch('/api/credit', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📡 Resposta créditos:', res.status);
    
    if (res.ok) {
      const credits = await res.json();
      console.log('✅ Créditos carregados:', credits);
      creditsTable.innerHTML = credits.map(credit => `
        <tr>
          <td>${credit.month}</td>
          <td>${credit.credits} kWh</td>
        </tr>
      `).join('');
    } else {
      const errorText = await res.text();
      console.log('❌ Erro ao carregar créditos:', errorText);
      creditsTable.innerHTML = '<tr><td colspan="2">Erro ao carregar créditos.</td></tr>';
    }
  }
  loadCredits();
}

// Função para atualizar o timestamp da última atividade no sessionStorage
function updateLastActivity() {
  sessionStorage.setItem('lastActivity', Date.now());
}

// Função para checar inatividade (15 minutos = 900000 ms)
function checkInactivity() {
  const lastActivity = Number(sessionStorage.getItem('lastActivity'));
  if (Date.now() - lastActivity > 900000) { // 15 minutos
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lastActivity');
    window.location.href = '/login_web/login.html';
  }
}

// Adiciona listeners para atividades do usuário
['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
  window.addEventListener(event, updateLastActivity)
);

// Inicializa o timestamp de atividade
updateLastActivity();

// Checa inatividade a cada minuto
setInterval(checkInactivity, 60000);

console.log('Token JWT:', getToken());

