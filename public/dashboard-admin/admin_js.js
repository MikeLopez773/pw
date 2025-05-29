// Verificação de autenticação e role ADMIN
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se existe token e se o utilizador é admin
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '../login_web/login.html';
    return;
  }
  try {
    // Remove o prefixo "Bearer " se existir para decodificar o token
    const tokenForDecode = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = JSON.parse(atob(tokenForDecode.split('.')[1]));
    if (payload.role !== 'admin') {
      window.location.href = '../login_web/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '../login_web/login.html';
    return;
  }

  // Atualiza o timestamp de atividade e verifica inatividade (15 minutos)
  function updateLastActivity() {
    sessionStorage.setItem('lastActivity', Date.now());
  }
  ['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
    window.addEventListener(event, updateLastActivity)
  );
  updateLastActivity();
  setInterval(() => {
    const lastActivity = Number(sessionStorage.getItem('lastActivity'));
    if (Date.now() - lastActivity > 900000) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('lastActivity');
      window.location.href = '../login_web/login.html';
    }
  }, 60000);

  // Função para carregar usuários na tabela de gestão (só executa se existir a tabela)
  async function loadUsers() {
    const table = document.getElementById('usersTable');
    const tbody = table ? table.querySelector('tbody') : null;
    if (!tbody) return;

    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        tbody.innerHTML = '';
        data.users.forEach(u => {
          const tr = document.createElement('tr');
          tr.dataset.userid = u._id;
          // Cria as células editáveis e a coluna de ações
          tr.innerHTML = `
            <td contenteditable="true" class="editable" data-field="username">${u.username}</td>
            <td contenteditable="true" class="editable" data-field="email">${u.email}</td>
            <td>
              <select class="role-select">
                <option value="cliente" ${u.role === 'cliente' ? 'selected' : ''}>Cliente</option>
                <option value="tecnico" ${u.role === 'tecnico' ? 'selected' : ''}>Técnico</option>
                <option value="gestor" ${u.role === 'gestor' ? 'selected' : ''}>Gestor</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </td>
            <td class="acoes"></td>
          `;
          tbody.appendChild(tr);
        });
        table.style.display = '';
      } else {
        tbody.innerHTML = '<tr><td colspan="3">Sem utilizadores.</td></tr>';
        table.style.display = '';
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  // Só chama loadUsers se existir a tabela na página
  if (document.getElementById('usersTable')) {
    loadUsers().then(ensureEditavelClass);
  }

  // Logout: Remove token e redireciona para a página principal
  // (botão pode ter id diferente em cada página, então procure por vários possíveis)
  const logoutBtn = document.getElementById('logoutBtn') ||
                    document.querySelector('button[onclick*="front.html"]');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('lastActivity');
      window.location.href = '../pagina_web/front.html';
    };
  }

  // Preenche estatísticas do admin se existir a secção
  async function loadAdminStats() {
    try {
      const res = await fetch('/api/auth/stats', {
        headers: { 'Authorization': sessionStorage.getItem('token') }
      });
      const stats = await res.json();
      console.log('Stats recebidos do backend:', stats);
      document.getElementById('totalUsers').textContent = stats.totalUsers ?? '--';
      document.getElementById('activeUsers').textContent = stats.activeUsers ?? '--';
      document.getElementById('totalClientes').textContent = stats.totalClientes ?? '--';
      document.getElementById('totalTecnicos').textContent = stats.totalTecnicos ?? '--';
      document.getElementById('totalGestores').textContent = stats.totalGestores ?? '--';
    } catch (e) {
      console.error('Erro ao buscar stats:', e);
    }
  }
  if (document.querySelector('.admin-stats')) loadAdminStats();

  // --- GESTÃO DOS BOTÕES OK/CANCELAR FORA DA TABELA ---

  // Referências aos botões flutuantes e mensagem
  const floatingActions = document.getElementById('floating-actions');
  const messageDiv = document.getElementById('message');
  let originalValues = {};
  let hasChanges = false;

  // Garante que todos os campos editáveis têm a classe 'editavel'
  function ensureEditavelClass() {
    document.querySelectorAll('td[contenteditable="true"], input[type="text"], input[type="email"], select').forEach(el => {
      if (!el.classList.contains('editavel')) el.classList.add('editavel');
    });
    document.querySelectorAll('select.role-select').forEach(el => {
      if (!el.classList.contains('editavel')) el.classList.add('editavel');
    });
  }
  ensureEditavelClass();

  // Guarda valores originais ao focar num campo editável
  document.addEventListener('focusin', function(e) {
    if (e.target.classList.contains('editavel')) {
      const tr = e.target.closest('tr');
      if (tr && !originalValues[tr.rowIndex]) {
        originalValues[tr.rowIndex] = Array.from(tr.querySelectorAll('.editavel')).map(i => i.value ?? i.textContent);
      }
    }
  });

  // Mostra botões flutuantes quando há alterações
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('editavel')) {
      hasChanges = true;
      floatingActions.style.display = 'flex';
    }
  });

  // Evento OK: esconde botões e mostra mensagem
  floatingActions.querySelector('.ok-btn').onclick = function() {
    floatingActions.style.display = 'none';
    hasChanges = false;
    messageDiv.textContent = 'Alterações guardadas!';
    setTimeout(() => messageDiv.textContent = '', 2000);
    originalValues = {};
  };

  // Evento Cancelar: repõe valores originais e esconde botões
  floatingActions.querySelector('.cancel-btn').onclick = function() {
    document.querySelectorAll('tbody tr').forEach((tr) => {
      if (originalValues[tr.rowIndex]) {
        Array.from(tr.querySelectorAll('.editavel')).forEach((input, i) => {
          if (input.tagName === 'INPUT' || input.tagName === 'SELECT') {
            input.value = originalValues[tr.rowIndex][i];
          } else {
            input.textContent = originalValues[tr.rowIndex][i];
          }
        });
      }
    });
    floatingActions.style.display = 'none';
    hasChanges = false;
    originalValues = {};
  };

  // Se carregares utilizadores dinamicamente, volta a garantir a classe 'editavel'
  if (typeof loadUsers === 'function') {
    const oldLoadUsers = loadUsers;
    loadUsers = async function() {
      await oldLoadUsers();
      ensureEditavelClass();
    };
  }

  // Menu de contexto personalizado para reset de password
  const contextMenu = document.getElementById('contextMenu');
  let selectedUserId = null;

  // Mostra o menu ao clicar com o botão direito numa linha da tabela
  document.getElementById('usersTable').addEventListener('contextmenu', function(e) {
    const tr = e.target.closest('tr');
    if (tr && tr.dataset.userid) {
      e.preventDefault();
      selectedUserId = tr.dataset.userid;
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
    } else {
      contextMenu.style.display = 'none';
    }
  });

  // Esconde o menu ao clicar fora
  document.addEventListener('click', function(e) {
    if (!contextMenu.contains(e.target)) {
      contextMenu.style.display = 'none';
    }
  });

  // Resetar password do utilizador selecionado
  document.getElementById('resetPwOption').onclick = async function() {
    contextMenu.style.display = 'none';
    if (!selectedUserId) return;
    if (!confirm('Tem a certeza que pretende resetar a password deste utilizador?')) return;
    try {
      const res = await fetch(`/api/auth/reset-password/${selectedUserId}`, {
        method: 'POST',
        headers: { 'Authorization': sessionStorage.getItem('token') }
      });
      if (res.ok) {
        alert('Password resetada com sucesso! O utilizador receberá uma nova password por email ou deverá definir uma nova no próximo login.');
      } else {
        alert('Erro ao resetar a password.');
      }
    } catch (err) {
      alert('Erro ao comunicar com o servidor.');
    }
  };
});