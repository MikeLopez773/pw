document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '../login_web/login.html';
    return;
  }

  let payload;
  try {
    const tokenForDecode = token.startsWith('Bearer ') ? token.slice(7) : token;
    payload = JSON.parse(atob(tokenForDecode.split('.')[1]));
    if (payload.role !== 'tecnico') {
      window.location.href = '../login_web/login.html';
      return;
    }
  } catch {
    window.location.href = '../login_web/login.html';
    return;
  }

  const usersGrid = document.getElementById('usersGrid');
  const filterInput = document.getElementById('filterUsers');
  let allUsers = [];

  // Carregar utilizadores (apenas clientes)
  async function loadUsers() {
    try {
      console.log('🔍 Carregando clientes com token:', token.substring(0, 30) + '...');
      
      const res = await fetch('/api/auth/clients', {
        headers: { 'Authorization': token }
      });
      
      console.log('📊 Status da resposta:', res.status);
      
      const data = await res.json();
      
      console.log('📋 Resposta completa:', data);
      console.log('👥 Clientes recebidos:', data.users?.length || 0);
      
      if (res.ok && data.users) {
        allUsers = data.users;
        displayUsers(allUsers);
      } else {
        console.error('❌ Erro na resposta:', data);
        usersGrid.innerHTML = '<p>Erro ao carregar clientes.</p>';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      usersGrid.innerHTML = '<p>Erro ao carregar clientes.</p>';
    }
  }

  // Exibir utilizadores
  function displayUsers(users) {
    if (users.length === 0) {
      usersGrid.innerHTML = '<p>Nenhum cliente encontrado.</p>';
      return;
    }

    usersGrid.innerHTML = users.map(user => `
      <div class="user-card">
        <h3>${user.username}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user._id}</p>
        <p><strong>Role:</strong> <span class="role-badge ${user.role}">${user.role}</span></p>
        <div class="user-actions">
          <button onclick="selectUserForCertification('${user._id}', '${user.username}')" class="btn-primary">
            Certificar Painel
          </button>
        </div>
      </div>
    `).join('');
  }

  // Filtrar utilizadores
  filterInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
    displayUsers(filteredUsers);
  });

  // Carregar painéis pendentes
  async function loadPendingPanels() {
    try {
      console.log('🔍 Carregando painéis pendentes...');
      
      const res = await fetch('/api/panels/pending', {
        headers: { 'Authorization': token }
      });
      
      const data = await res.json();
      const container = document.getElementById('pendingPanels');
      
      if (res.ok && data.panels && data.panels.length) {
        container.innerHTML = data.panels.map(panel => `
          <div class="panel-card pending clickable" onclick="certifyPanel('${panel._id}', '${panel.user ? panel.user._id : ''}', '${panel.user ? panel.user.username : 'N/A'}')">
            <div class="panel-header">
              <h4>📋 Painel ${panel._id.substring(panel._id.length - 8)}</h4>
              <span class="status-badge pending">Pendente</span>
            </div>
            <div class="panel-info">
              <p><strong>👤 Cliente:</strong> ${panel.user ? panel.user.username : 'N/A'}</p>
              <p><strong>📍 Localização:</strong> ${panel.location}</p>
              <p><strong>⚡ Capacidade:</strong> ${panel.capacity} kW</p>
              <p><strong>📅 Data de Instalação:</strong> ${new Date(panel.installationDate).toLocaleDateString('pt-PT')}</p>
            </div>
            <div class="panel-actions">
              <p class="click-hint">🖱️ Clique para certificar este painel</p>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <h3>✅ Nenhum painel pendente</h3>
            <p>Todos os painéis estão certificados!</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar painéis pendentes:', error);
      document.getElementById('pendingPanels').innerHTML = `
        <div class="error-state">
          <h3>❌ Erro ao carregar painéis</h3>
          <p>Tente recarregar a página</p>
        </div>
      `;
    }
  }

  // Selecionar utilizador para certificação (botão dos usuários)
  window.selectUserForCertification = function(userId, username) {
    sessionStorage.setItem('selectedUserId', userId);
    sessionStorage.setItem('selectedUsername', username);
    window.location.href = 'tecnico-dashboard.html#certification';
  };

  // Certificar painel específico (clique no painel pendente)
  window.certifyPanel = function(panelId, userId, username) {
    console.log('🎯 Certificar painel:', { panelId, userId, username });
    
    // Salvar dados do painel e usuário no sessionStorage
    sessionStorage.setItem('selectedPanelId', panelId);
    sessionStorage.setItem('selectedUserId', userId);
    sessionStorage.setItem('selectedUsername', username);
    
    // Redirecionar para a página de certificação
    window.location.href = 'tecnico-dashboard.html#certification';
  };

  // Inicializar
  loadUsers();
  loadPendingPanels();
});
