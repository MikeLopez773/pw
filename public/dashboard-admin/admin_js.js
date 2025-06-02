document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) return window.location.href = '../login_web/login.html';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return window.location.href = '../login_web/login.html';
  } catch (err) {
    return window.location.href = '../login_web/login.html';
  }

  sessionStorage.setItem('lastActivity', Date.now());
  ['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
    window.addEventListener(event, () => sessionStorage.setItem('lastActivity', Date.now()))
  );
  setInterval(() => {
    const last = Number(sessionStorage.getItem('lastActivity'));
    if (Date.now() - last > 900000) {
      sessionStorage.clear();
      window.location.href = '../login_web/login.html';
    }
    // --- ALTERAR A PRÓPRIA PASSWORD ---
const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = resetForm.oldPassword.value;
    const newPassword = resetForm.newPassword.value;

    const token = sessionStorage.getItem('token');
    if (!token) return alert('Sessão expirada.');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      document.getElementById('message').textContent = data.message;
      document.getElementById('message').style.color = res.ok ? 'green' : 'red';

      if (res.ok) resetForm.reset();
    } catch (err) {
      document.getElementById('message').textContent = 'Erro ao alterar password.';
      document.getElementById('message').style.color = 'red';
    }
  });
}
  }, 60000);

  async function loadUsers() {
    const table = document.getElementById('usersTable');
    const tbody = table?.querySelector('tbody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/auth/users', { headers: { 'Authorization': token } });
      const data = await res.json();
      tbody.innerHTML = '';
      if (res.ok && data.users) {
        data.users.forEach(u => {
          const tr = document.createElement('tr');
          tr.dataset.userid = u._id;
          tr.innerHTML = `
            <td contenteditable="true" class="editable" data-field="username">${u.username}</td>
            <td contenteditable="true" class="editable" data-field="email">${u.email}</td>
            <td>
              <select class="role-select">
                <option value="cliente"${u.role === 'cliente' ? ' selected' : ''}>Cliente</option>
                <option value="tecnico"${u.role === 'tecnico' ? ' selected' : ''}>Técnico</option>
                <option value="gestor"${u.role === 'gestor' ? ' selected' : ''}>Gestor</option>
                <option value="admin"${u.role === 'admin' ? ' selected' : ''}>Admin</option>
              </select>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="3">Sem utilizadores.</td></tr>';
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  if (document.getElementById('usersTable')) loadUsers();

  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('[onclick*="front.html"]');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.clear();
      window.location.href = '../pagina_web/front.html';
    };
  }

  if (document.querySelector('.admin-stats')) {
    fetch('/api/auth/stats', { headers: { Authorization: token } })
      .then(res => res.json())
      .then(stats => {
        document.getElementById('totalUsers').textContent = stats.totalUsers ?? '--';
        document.getElementById('activeUsers').textContent = stats.activeUsers ?? '--';
        document.getElementById('totalClientes').textContent = stats.totalClientes ?? '--';
        document.getElementById('totalTecnicos').textContent = stats.totalTecnicos ?? '--';
        document.getElementById('totalGestores').textContent = stats.totalGestores ?? '--';
      }).catch(err => console.error(err));
  }

  // 🔍 FILTRAR NA PESQUISA
  const searchInput = document.getElementById('userSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll('#usersTable tbody tr');

      rows.forEach(row => {
        const username = row.querySelector('td[data-field="username"]')?.textContent.toLowerCase() || '';
        const email = row.querySelector('td[data-field="email"]')?.textContent.toLowerCase() || '';
        if (username.includes(searchTerm) || email.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
});