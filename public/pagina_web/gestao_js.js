const historico = [];

let grafico;
function inicializarGrafico() {
  const ctx = document.getElementById('graficoProducao').getContext('2d');
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Produção (W)',
        data: [],
        borderColor: '#0066cc',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function atualizarGrafico(valor) {
  const timestamp = new Date().toLocaleTimeString();
  historico.push({ tempo: timestamp, valor });

  if (historico.length > 10) historico.shift();

  grafico.data.labels = historico.map(d => d.tempo);
  grafico.data.datasets[0].data = historico.map(d => d.valor);
  grafico.update();
}

async function atualizarDados() {
  try {
    const res = await fetch('http://localhost:4000/');
    if (!res.ok) throw new Error('Erro ao buscar dados da API');

    const data = await res.json();
    const valor = data.value;

    document.getElementById('power').innerText = `${valor} W`;
    document.getElementById('today').innerText = `${(valor / 100).toFixed(2)} kWh`;
    document.getElementById('status').innerText = 'Sistema operacional';
    document.getElementById('credits').innerText = `${(valor / 10).toFixed(2)} €`;

    atualizarGrafico(valor);
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    document.getElementById('status').innerText = 'Erro ao obter dados';
  }
}

window.onload = () => {
  inicializarGrafico();
  atualizarDados();
  setInterval(atualizarDados, 5000);
};