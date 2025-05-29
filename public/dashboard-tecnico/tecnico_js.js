// Função de redirecionamento para o login
function redirectLogin() {
  window.location.href = '../login_web/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  
  if (!token) return redirectLogin();

  let payload;
  try {
    const tokenForDecode = token.startsWith('Bearer ') ? token.slice(7) : token;
    payload = JSON.parse(atob(tokenForDecode.split('.')[1]));
    if (payload.role !== 'tecnico') return redirectLogin();
  } catch {
    return redirectLogin();
  }

  const searchForm = document.getElementById('searchUserForm');
  const certForm = document.getElementById('certificateForm');
  const userResult = document.getElementById('userResult');

  // VERIFICAR SE VEIO DA PÁGINA DE GESTÃO COM DADOS PRÉ-SELECIONADOS
  function checkPreselectedData() {
    const selectedPanelId = sessionStorage.getItem('selectedPanelId');
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    const selectedUsername = sessionStorage.getItem('selectedUsername');
    
    if (selectedPanelId && selectedUserId && selectedUsername) {
      console.log('🎯 Dados pré-selecionados encontrados:', {
        panelId: selectedPanelId,
        userId: selectedUserId,
        username: selectedUsername
      });
      
      // Preencher automaticamente os campos
      document.getElementById('panelId').value = selectedPanelId;
      document.getElementById('userId').value = selectedUserId;
      document.getElementById('username').value = selectedUsername;
      
      // Mostrar informações do usuário
      userResult.innerHTML = `
        <div class="user-found auto-selected">
          <h3>🎯 Painel Selecionado para Certificação:</h3>
          <p><strong>ID do Painel:</strong> ${selectedPanelId}</p>
          <p><strong>Nome do Cliente:</strong> ${selectedUsername}</p>
          <p><strong>ID do Cliente:</strong> ${selectedUserId}</p>
          <div class="auto-selected-note">
            <small>ℹ️ Dados preenchidos automaticamente da página de gestão</small>
          </div>
        </div>
      `;
      
      // Mostrar o formulário de certificação
      certForm.style.display = 'block';
      
      // Focar no campo de upload do certificado
      document.getElementById('certificate').focus();
      
      // Limpar os dados do sessionStorage
      sessionStorage.removeItem('selectedPanelId');
      sessionStorage.removeItem('selectedUserId');
      sessionStorage.removeItem('selectedUsername');
      
      // Scrollar para a seção de certificação
      document.getElementById('certificateForm').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  // Pesquisar utilizador (método manual)
  searchForm.onsubmit = async function (e) {
    e.preventDefault();
    const query = document.getElementById('searchUser').value.trim();
    if (!query) return;

    try {
      const res = await fetch(`/api/auth/user/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': token }
      });

      const data = await res.json();
      if (res.ok && data.user) {
        userResult.innerHTML = `
          <div class="user-found">
            <h3>Utilizador Encontrado:</h3>
            <p><strong>Nome:</strong> ${data.user.username}</p>
            <p><strong>ID:</strong> ${data.user._id}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
          </div>
        `;
        document.getElementById('userId').value = data.user._id;
        document.getElementById('username').value = data.user.username;
        // Limpar o panelId para pesquisa manual
        document.getElementById('panelId').value = '';
        certForm.style.display = 'block';
      } else {
        userResult.innerHTML = `<div class="user-not-found">Cliente não encontrado.</div>`;
        certForm.style.display = 'none';
      }
    } catch (error) {
      console.error('Erro ao pesquisar utilizador:', error);
      userResult.innerHTML = `<div class="error">Erro ao pesquisar utilizador.</div>`;
    }
  };

  // Certificar painel
  certForm.onsubmit = async function (e) {
    e.preventDefault();
    const panelId = this.panelId.value.trim();
    const userId = this.userId.value.trim();
    const username = this.username.value.trim();
    const file = this.certificate.files[0];

    if (!file || file.type !== 'application/pdf') {
      showMessage('Por favor, selecione um ficheiro PDF.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('panelId', panelId);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('certificate', file);

    try {
      const res = await fetch('/api/panels/certificate', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || 'Painel certificado com sucesso!', 'success');
        this.reset();
        certForm.style.display = 'none';
        userResult.innerHTML = '';
        loadCertifiedPanels();
      } else {
        showMessage(data.message || 'Erro ao certificar painel.', 'error');
      }
    } catch (error) {
      console.error('Erro ao certificar painel:', error);
      showMessage('Erro ao certificar painel.', 'error');
    }
  };

  // Carregar painéis certificados
  async function loadCertifiedPanels() {
    try {
      console.log('🚀 Fazendo requisição com token:', token);
      
      const res = await fetch('/api/panels/certified', {
        headers: { 'Authorization': token }
      });
      
      console.log('📊 Status da resposta:', res.status);
      
      const data = await res.json();
      const container = document.getElementById('certifiedPanels');
      
      if (res.ok && data.panels && data.panels.length) {
        container.innerHTML = data.panels.map(panel => `
          <div class="panel-card">
            <h4>Painel ${panel.panelId}</h4>
            <p><strong>Cliente:</strong> ${panel.username}</p>
            <p><strong>Data de Certificação:</strong> ${new Date(panel.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> Certificado</p>
          </div>
        `).join('');
      } else {
        console.log('❌ Erro na resposta:', data);
        container.innerHTML = '<p>Nenhum painel certificado encontrado.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      document.getElementById('certifiedPanels').innerHTML = '<p>Erro ao carregar painéis.</p>';
    }
  }

  // Função para mostrar mensagens
  function showMessage(msg, type = 'info') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = msg;
      messageEl.className = type;
      setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = '';
      }, 4000);
    }
  }

  // Inicializar
  checkPreselectedData(); // VERIFICAR dados pré-selecionados primeiro
  loadCertifiedPanels();
});

// Implementação do timeout de inatividade (15 minutos)
function updateLastActivity() {
  sessionStorage.setItem('lastActivity', Date.now());
}

function checkInactivity() {
  const lastActivity = Number(sessionStorage.getItem('lastActivity'));
  if (Date.now() - lastActivity > 900000) { // 900000 ms = 15 minutos
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lastActivity');
    window.location.href = '../login_web/login.html';
  }
}

// Monitora atividades do usuário e atualiza o timestamp
['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
  window.addEventListener(event, updateLastActivity)
);
updateLastActivity();
setInterval(checkInactivity, 60000);
