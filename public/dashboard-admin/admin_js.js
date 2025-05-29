// Verificação de autenticação e role ADMIN
document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '../login_web/login.html';
    return;
  }
  try {
    // Removemos o prefixo "Bearer " para decodificar o token
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

  // Atualiza o timestamp de atividade e checa inatividade (15 minutos)
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
    loadUsers();
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

  // Exemplo de preenchimento dinâmico (coloque dentro do DOMContentLoaded)
  async function loadAdminStats() {
    try {
      const res = await fetch('/api/auth/stats', {
        headers: { 'Authorization': sessionStorage.getItem('token') }
      });
      const stats = await res.json();
      console.log('Stats recebidos do backend:', stats); // <-- ADICIONA ESTA LINHA
      document.getElementById('totalUsers').textContent = stats.totalUsers ?? '--';
      document.getElementById('activeUsers').textContent = stats.activeUsers ?? '--';
      document.getElementById('totalClientes').textContent = stats.totalClientes ?? '--';
      document.getElementById('totalTecnicos').textContent = stats.totalTecnicos ?? '--';
      document.getElementById('totalGestores').textContent = stats.totalGestores ?? '--';
    } catch (e) {
      console.error('Erro ao buscar stats:', e); // <-- ADICIONA ESTA LINHA
    }
  }
  if (document.querySelector('.admin-stats')) loadAdminStats();

  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('editavel')) {
      const tr = e.target.closest('tr');
      const acoesTd = tr.querySelector('.acoes');
      // Só adiciona se ainda não existirem botões
      if (!acoesTd.querySelector('.ok-btn')) {
        acoesTd.innerHTML = `
          <button class="ok-btn">OK</button>
          <button class="cancel-btn">Cancelar</button>
        `;
        // Evento OK
        acoesTd.querySelector('.ok-btn').onclick = function() {
          acoesTd.innerHTML = '';
          document.getElementById('message').textContent = 'Alterações guardadas!';
          setTimeout(() => document.getElementById('message').textContent = '', 2000);
        };
        // Evento Cancelar
        acoesTd.querySelector('.cancel-btn').onclick = function() {
          // Recarrega a página para desfazer alterações (ou podes guardar o valor original e repor)
          window.location.reload();
        };
      }
    }
  });

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

  // Guarda valores originais ao focar
  document.addEventListener('focusin', function(e) {
    if (e.target.classList.contains('editavel')) {
      const tr = e.target.closest('tr');
      if (tr && !originalValues[tr.rowIndex]) {
        originalValues[tr.rowIndex] = Array.from(tr.querySelectorAll('.editavel')).map(i => i.value ?? i.textContent);
      }
    }
  });

  // Mostra botões só quando houver alterações
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('editavel')) {
      hasChanges = true;
      floatingActions.style.display = 'flex';
    }
  });

  // OK: esconde botões e mostra mensagem
  floatingActions.querySelector('.ok-btn').onclick = function() {
    floatingActions.style.display = 'none';
    hasChanges = false;
    messageDiv.textContent = 'Alterações guardadas!';
    setTimeout(() => messageDiv.textContent = '', 2000);
    originalValues = {};
  };

  // Cancelar: repõe valores originais e esconde botões
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
});