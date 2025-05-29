document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Erro: Token não encontrado. Faça login novamente.');
    window.location.href = '../login_web/login.html';
    return;
  }

  try {
    // Fazer requisição para obter os dados de créditos
    const response = await fetch('/api/credits/history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar dados de créditos.');
    }

    const creditos = await response.json();

    // Preencher a tabela
    const tableBody = document.querySelector('#creditosTable tbody');
    creditos.forEach((credito) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${credito.mes}</td>
        <td>${credito.creditosGanhos}</td>
        <td>${credito.creditosUsados}</td>
        <td>${credito.saldoFinal}</td>
      `;
      tableBody.appendChild(row);
    });

    // Preparar os dados para o gráfico
    const labels = creditos.map((credito) => credito.mes);
    const ganhos = creditos.map((credito) => credito.creditosGanhos);
    const usados = creditos.map((credito) => credito.creditosUsados);

    // Gerar o gráfico
    const ctx = document.getElementById('creditosChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Créditos Ganhos',
            data: ganhos,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Créditos Usados',
            data: usados,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    alert('Erro ao carregar os dados de créditos.');
  }
});