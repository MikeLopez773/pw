// Função de redirecionamento para o login
function redirectLogin() {
  window.location.href = '../login_web/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) return redirectLogin();

  // Verifica role gestor
  let payload;
  try {
    const tokenForDecode = token.startsWith('Bearer ') ? token.slice(7) : token;
    payload = JSON.parse(atob(tokenForDecode.split('.')[1]));
    if (payload.role !== 'gestor') return redirectLogin();
  } catch (err) {
    return redirectLogin();
  }

  // Carrega o resumo geral ao iniciar
  loadDashboardGeneral();

  // Carregar clientes na grid
  loadClientsGrid();

  // Pesquisa manual de cliente
  const monitorForm = document.getElementById('monitorForm');
  if (monitorForm) {
    monitorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = monitorForm.userId.value.trim();
      if (!userId) return;

      await updateDashboardForClient(userId);
    });
  }

  // Filtro de clientes por nome ou email
  const filterInput = document.getElementById('filterClients');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filteredClients = allClients.filter(client =>
        client.username.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
      displayClients(filteredClients);
    });
  }

  // Inicializar gráficos
  initializeCharts();
});

let allClients = [];

// Carregar e exibir clientes na grid
async function loadClientsGrid() {
  const token = sessionStorage.getItem('token');
  try {
    // MUDAR de '/api/auth/clients' para '/api/auth/clients-for-gestor'
    const res = await fetch('/api/auth/clients-for-gestor', {
      headers: { 'Authorization': token }
    });
    
    if (res.ok) {
      const data = await res.json();
      allClients = data.users || [];
      displayClients(allClients);
    } else {
      console.error('Erro na resposta:', res.status);
      document.getElementById('clientsGrid').innerHTML = '<p>Erro ao carregar clientes.</p>';
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    document.getElementById('clientsGrid').innerHTML = '<p>Erro ao carregar clientes.</p>';
  }
}

// Exibir clientes na grid
function displayClients(clients) {
  const clientsGrid = document.getElementById('clientsGrid');
  
  if (clients.length === 0) {
    clientsGrid.innerHTML = '<p>Nenhum cliente encontrado.</p>';
    return;
  }

  clientsGrid.innerHTML = clients.map(client => `
    <div class="client-card" onclick="selectClient('${client._id}', '${client.username}')">
      <h3>${client.username}</h3>
      <p><strong>Email:</strong> ${client.email}</p>
      <p><strong>ID:</strong> ${client._id}</p>
      <div class="client-actions">
        <button class="btn-primary" onclick="event.stopPropagation(); selectClient('${client._id}', '${client.username}')">
          Ver Produção
        </button>
      </div>
    </div>
  `).join('');
}

// Selecionar cliente (clique no cartão)
window.selectClient = async function(clientId, clientName) {
  console.log('🎯 Cliente selecionado:', { clientId, clientName });
  
  // Preencher o campo de pesquisa
  document.getElementById('userId').value = clientId;
  
  // Atualizar dashboard com dados deste cliente
  await updateDashboardForClient(clientId);
};

// Inicializar gráficos
let productionChart, efficiencyChart, clientsChart, weeklyChart;

// Inicializar todos os gráficos
function initializeCharts() {
  createProductionChart();
  createEfficiencyChart();
  createClientsChart();
  createWeeklyChart();
}

// 1. Gráfico de Produção por Hora (Últimas 24h)
function createProductionChart() {
  const ctx = document.getElementById('productionChart').getContext('2d');
  
  // Gerar dados mock para as últimas 24 horas
  const hours = [];
  const production = [];
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    hours.push(hour.getHours() + ':00');
    production.push((Math.random() * 15 + 5).toFixed(1)); // 5-20 kWh
  }

  productionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Produção (kWh)',
        data: production,
        borderColor: '#2a7ae4',
        backgroundColor: 'rgba(42, 122, 228, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Produção (kWh)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hora'
          }
        }
      }
    }
  });
}

// 2. Gráfico de Eficiência dos Painéis
function createEfficiencyChart() {
  const ctx = document.getElementById('efficiencyChart').getContext('2d');
  
  efficiencyChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Excelente (>90%)', 'Boa (75-90%)', 'Regular (60-75%)', 'Baixa (<60%)'],
      datasets: [{
        data: [25, 45, 20, 10], // Percentagens
        backgroundColor: [
          '#4caf50',
          '#2a7ae4',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// 3. Gráfico de Comparação de Clientes (Top 5)
function createClientsChart() {
  const ctx = document.getElementById('clientsChart').getContext('2d');
  
  clientsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'],
      datasets: [{
        label: 'Produção Total (kWh)',
        data: [120, 95, 80, 65, 45],
        backgroundColor: [
          '#2a7ae4',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#607d8b'
        ],
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Produção (kWh)'
          }
        }
      }
    }
  });
}

// 4. Gráfico de Tendência Semanal
function createWeeklyChart() {
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const thisWeek = [85, 92, 78, 95, 88, 70, 65];
  const lastWeek = [80, 87, 82, 90, 85, 75, 68];

  weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Esta Semana',
          data: thisWeek,
          borderColor: '#2a7ae4',
          backgroundColor: 'rgba(42, 122, 228, 0.1)',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'Semana Anterior',
          data: lastWeek,
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Produção Média (kWh)'
          }
        }
      }
    }
  });
}

// Função para atualizar gráficos com dados reais de um cliente
function updateChartsForClient(clientId, productionData) {
  // Atualizar gráfico de produção com dados reais
  if (productionChart && productionData.readings) {
    const newData = productionData.readings.map(r => r.value);
    const newLabels = productionData.readings.map(r => 
      new Date(r.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    );
    
    productionChart.data.labels = newLabels;
    productionChart.data.datasets[0].data = newData;
    productionChart.update();
  }
}

// Atualizar a função existente para incluir gráficos
async function updateDashboardForClient(clientId) {
  const token = sessionStorage.getItem('token');
  
  try {
    // 1. Stats do cliente
    const statsRes = await fetch(`/api/monitoring/stats/${clientId}`, {
      headers: { 'Authorization': token }
    });
    if (statsRes.ok) {
      const stats = await statsRes.json();
      setTextById('totalProduction', stats.totalProduction ? `${stats.totalProduction} kWh` : 'N/A');
      setTextById('activePanels', stats.activePanels || 'N/A');
      setTextById('averageEfficiency', stats.averageEfficiency ? `${stats.averageEfficiency}%` : 'N/A');
    }

    // 2. Produção mais recente do cliente
    const prodRes = await fetch(`/api/monitoring/production/${clientId}`, {
      headers: { 'Authorization': token }
    });
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      if (prodData.readings && prodData.readings.length) {
        document.getElementById('latestProduction').textContent =
          `${prodData.readings[0].value} kWh (${new Date(prodData.readings[0].timestamp).toLocaleString()})`;
        
        // 3. Leituras detalhadas
        const readingsDiv = document.getElementById('productionReadings');
        readingsDiv.innerHTML = '<h3>Leituras de Produção:</h3>' +
          prodData.readings.map(r =>
            `<div class="reading-item">
              <span class="timestamp">${new Date(r.timestamp).toLocaleString()}</span>
              <span class="value">${r.value} kWh</span>
            </div>`
          ).join('');

        // Só chama updateChartsForClient se prodData existir
        updateChartsForClient(clientId, prodData);
      } else {
        document.getElementById('latestProduction').textContent = 'Sem dados';
        document.getElementById('productionReadings').innerHTML = '<h3>Sem leituras disponíveis para este cliente.</h3>';
      }
    }

    // Guardar último cliente pesquisado
    sessionStorage.setItem('lastClientId', clientId);

  } catch (error) {
    console.error('Erro ao carregar dados do cliente:', error);
    document.getElementById('totalProduction').textContent = 'Erro';
    document.getElementById('activePanels').textContent = 'Erro';
    document.getElementById('averageEfficiency').textContent = 'Erro';
    document.getElementById('latestProduction').textContent = 'Erro';
  }
}

// Carrega o resumo geral (todos os clientes)
async function loadDashboardGeneral() {
  const token = sessionStorage.getItem('token');
  try {
    const statsRes = await fetch('/api/monitoring/stats', {
      headers: { 'Authorization': token }
    });

    if (statsRes.ok) {
      const stats = await statsRes.json();

      setTextById('totalProduction', stats.totalProduction ? `${stats.totalProduction} kWh` : 'N/A');
      setTextById('activePanels', stats.activePanels || 'N/A');
      setTextById('averageEfficiency', stats.averageEfficiency ? `${stats.averageEfficiency}%` : 'N/A');
    }

    // Buscar produção mais recente do cliente pesquisado
    const clientId = sessionStorage.getItem('lastClientId');
    if (clientId) {
      const prodRes = await fetch(`/api/monitoring/production/${clientId}`, {
        headers: { 'Authorization': token }
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setTextById('latestProduction', prodData.readings && prodData.readings.length
          ? `${prodData.readings[0].value} kWh (${new Date(prodData.readings[0].timestamp).toLocaleString()})`
          : 'Sem dados'
        );
      } else {
        document.getElementById('latestProduction').textContent = 'Erro ao obter produção';
      }
    } else {
      document.getElementById('latestProduction').textContent = 'Pesquise um cliente!';
    }

  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    document.getElementById('latestProduction').textContent = 'Erro ao carregar';
  }
}

// Função para carregar a produção de um cliente específico
async function loadClientProduction(clientId) {
  const token = sessionStorage.getItem('token');

  try {
    const res = await fetch(`/api/monitoring/production/${clientId}`, {
      headers: { 'Authorization': token }
    });
    const data = await res.json();

    if (res.ok && data.readings && data.readings.length) {
      document.getElementById('latestProduction').textContent =
        `${data.readings[0].value} kWh (${new Date(data.readings[0].timestamp).toLocaleString()})`;
    } else {
      document.getElementById('latestProduction').textContent = 'Sem dados';
    }
  } catch (error) {
    console.error('Erro ao carregar produção do cliente:', error);
    document.getElementById('latestProduction').textContent = 'Erro ao carregar';
  }
}

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

// Função auxiliar para definir texto por ID
function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
