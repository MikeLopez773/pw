async function atualizarDados() {
  try {
    // Faz uma chamada à API para buscar os dados
    const res = await fetch('http://localhost:4000/'); // Substitui pela URL da tua API
    if (!res.ok) {
      throw new Error('Erro ao buscar dados da API');
    }

    const data = await res.json();

    // Atualiza os elementos com os dados reais
    document.getElementById('power').innerText = `${data.value} W`;
    document.getElementById('today').innerText = `${(data.value / 100).toFixed(2)} kWh`; // Exemplo de cálculo
    document.getElementById('status').innerText = 'Sistema operacional';
    document.getElementById('credits').innerText = `${(data.value / 10).toFixed(2)} €`; // Exemplo de cálculo
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    document.getElementById('status').innerText = 'Erro ao obter dados';
  }
}

// Atualiza os dados ao carregar a página e a cada 5 segundos
atualizarDados();
setInterval(atualizarDados, 5000);
