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

  // --- Painéis Pendentes ---
  const pendingPanelsContainer = document.getElementById('pendingPanels');
  const filterPendingPanels = document.getElementById('filterPendingPanels');
  let allPendingPanels = [];

  async function loadPendingPanels() {
    if (!pendingPanelsContainer) return;
    try {
      const res = await fetch('/api/panels/pending', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok && data.panels) {
        allPendingPanels = data.panels;
        displayPendingPanels(allPendingPanels);
      } else {
        pendingPanelsContainer.innerHTML = '<p>Erro ao carregar painéis pendentes.</p>';
      }
    } catch (error) {
      pendingPanelsContainer.innerHTML = '<p>Erro ao carregar painéis pendentes.</p>';
    }
  }

  function displayPendingPanels(panels) {
    if (!pendingPanelsContainer) return;
    if (!panels.length) {
      pendingPanelsContainer.innerHTML = '<p>Nenhum painel pendente encontrado.</p>';
      return;
    }
    pendingPanelsContainer.innerHTML = panels.map(panel => `
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
  }

  if (filterPendingPanels) {
    filterPendingPanels.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allPendingPanels.filter(panel =>
        panel._id.toLowerCase().includes(query) ||
        (panel.user && panel.user.username && panel.user.username.toLowerCase().includes(query))
      );
      displayPendingPanels(filtered);
    });
  }

  // --- Painéis Certificados ---
  const certifiedPanelsContainer = document.getElementById('certifiedPanels');
  const filterCertifiedPanels = document.getElementById('filterCertifiedPanels');
  let allCertifiedPanels = [];

  async function loadCertifiedPanels() {
    if (!certifiedPanelsContainer) return;
    try {
      const res = await fetch('/api/panels/certified', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok && data.panels) {
        allCertifiedPanels = data.panels;
        displayCertifiedPanels(allCertifiedPanels);
      } else {
        certifiedPanelsContainer.innerHTML = '<p>Erro ao carregar painéis certificados.</p>';
      }
    } catch (error) {
      certifiedPanelsContainer.innerHTML = '<p>Erro ao carregar painéis certificados.</p>';
    }
  }

  function displayCertifiedPanels(panels) {
    if (!certifiedPanelsContainer) return;
    if (!panels.length) {
      certifiedPanelsContainer.innerHTML = '<p>Nenhum painel certificado encontrado.</p>';
      return;
    }
    certifiedPanelsContainer.innerHTML = panels.map(panel => `
      <div class="panel-card">
        <h4>Painel ${panel.panelId || panel._id}</h4>
        <p><strong>Cliente:</strong> ${panel.username}</p>
        <p><strong>Data de Certificação:</strong> ${panel.certificationDate ? new Date(panel.certificationDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Status:</strong> Certificado</p>
      </div>
    `).join('');
  }

  if (filterCertifiedPanels) {
    filterCertifiedPanels.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allCertifiedPanels.filter(panel =>
        (panel.panelId && panel.panelId.toLowerCase().includes(query)) ||
        (panel._id && panel._id.toLowerCase().includes(query)) ||
        (panel.username && panel.username.toLowerCase().includes(query))
      );
      displayCertifiedPanels(filtered);
    });
  }

  // --- Certificação de Painel (via utilizador ou painel pendente) ---
  const searchForm = document.getElementById('searchUserForm');
  const certForm = document.getElementById('certificateForm');
  const userResult = document.getElementById('userResult');

  window.certifyPanel = function(panelId, userId, username) {
    document.getElementById('panelId').value = panelId;
    document.getElementById('userId').value = userId;
    document.getElementById('username').value = username;
    userResult.innerHTML = `
      <div class="user-found auto-selected">
        <h3>🎯 Painel Selecionado para Certificação:</h3>
        <p><strong>ID do Painel:</strong> ${panelId}</p>
        <p><strong>Nome do Cliente:</strong> ${username}</p>
        <p><strong>ID do Cliente:</strong> ${userId}</p>
      </div>
    `;
    certForm.style.display = 'block';
    document.getElementById('certificate').focus();
    certForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (searchForm) {
    searchForm.onsubmit = async function (e) {
      e.preventDefault();
      const query = document.getElementById('searchUser').value.trim();
      if (!query) {
        showMessage('Por favor, insira um nome ou ID para pesquisar.', 'error');
        return;
      }
      try {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        const res = await fetch(`/api/auth/user/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': authToken,
            'Cache-Control': 'no-cache'
          }
        });
        const data = await res.json();
        let user = null;
        if (Array.isArray(data)) {
          if (data.length > 0) user = data[0];
        } else if (data && typeof data === 'object' && data._id) {
          user = data;
        }
        if (user) {
          userResult.innerHTML = `
            <div class="user-found">
              <h3>✅ Utilizador Encontrado:</h3>
              <p><strong>Nome:</strong> ${user.username}</p>
              <p><strong>ID:</strong> ${user._id}</p>
              <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
              <p><strong>Função:</strong> ${user.role}</p>
            </div>
          `;
          document.getElementById('userId').value = user._id;
          document.getElementById('username').value = user.username;
          document.getElementById('panelId').value = '';
          certForm.style.display = 'block';
          showMessage('Utilizador encontrado com sucesso!', 'success');
        } else {
          userResult.innerHTML = `<div class="user-not-found">❌ Utilizador "${query}" não encontrado.</div>`;
          certForm.style.display = 'none';
          showMessage('Utilizador não encontrado.', 'error');
        }
      } catch (error) {
        userResult.innerHTML = `<div class="error">❌ Erro de conexão.</div>`;
        showMessage('Erro ao pesquisar utilizador.', 'error');
      }
    };
  }

  if (certForm) {
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
          loadPendingPanels();
        } else {
          showMessage(data.message || 'Erro ao certificar painel.', 'error');
        }
      } catch (error) {
        showMessage('Erro ao certificar painel.', 'error');
      }
    };
  }

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

  // Inicialização
  loadPendingPanels();
  loadCertifiedPanels();
});
