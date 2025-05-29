// Simula a leitura de produção de energia de um painel solar
// Gera um valor aleatório entre 1 e 10 kWh

function getRandomProduction() {
  return Math.floor(Math.random() * 10) + 1; // 1 a 10 kWh
}

// Simula chamada à API do cliente para obter produção atual
async function fetchPanelProduction(panelId) {
  // Em ambiente real, faria um pedido HTTP ao sistema do cliente
  // Aqui apenas simula com um valor aleatório
  return {
    panelId,
    production: getRandomProduction(),
    timestamp: new Date()
  };
}

module.exports = {
  fetchPanelProduction,
};