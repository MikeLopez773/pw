(function checkAuth() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Por favor, autentique-se para efetuar compras.');
    window.location.href = '/login_web/login.html';
  }
})();

function renderResumoCarrinho() {
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho') || '[]');
  const resumoDiv = document.getElementById('resumoCarrinho');
  if (!carrinho.length) {
    resumoDiv.innerHTML = "<p>O seu carrinho está vazio.</p>";
    document.getElementById('pagamentoForm').style.display = "none";
    return;
  }
  let html = "<ul>";
  let total = 0;
  carrinho.forEach(item => {
    html += `<li>${item.nome} x${item.qtd} - ${(item.preco * item.qtd).toFixed(2)} €</li>`;
    total += item.preco * item.qtd;
  });
  html += "</ul>";
  html += `<div class="carrinho-total">Total: ${total.toFixed(2)} €</div>`;
  resumoDiv.innerHTML = html;
}

document.getElementById('pagamentoForm').onsubmit = function(e) {
  e.preventDefault();

  // Validação extra para número do cartão (Luhn algorithm)
  const numero = this.querySelector('[autocomplete="cc-number"]').value.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(numero) || !luhnCheck(numero)) {
    document.getElementById('pagamentoMensagem').innerText = "Número de cartão inválido.";
    return;
  }

  // Validação extra para validade
  const validade = this.querySelector('[autocomplete="cc-exp"]').value;
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
    document.getElementById('pagamentoMensagem').innerText = "Validade inválida.";
    return;
  }

  // Validação extra para CVC
  const cvc = this.querySelector('[autocomplete="cc-csc"]').value;
  if (!/^\d{3,4}$/.test(cvc)) {
    document.getElementById('pagamentoMensagem').innerText = "CVC inválido.";
    return;
  }

  document.getElementById('pagamentoMensagem').innerText = "Pagamento efetuado com sucesso! Obrigado pela sua compra.";
  sessionStorage.removeItem('carrinho');
  setTimeout(() => {
    document.getElementById('pagamentoMensagem').innerText = "";
    window.location.href = 'front.html';
  }, 3500);
};

// Algoritmo de Luhn para validar cartões de crédito
function luhnCheck(val) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = val.length - 1; i >= 0; i--) {
    let digit = parseInt(val.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
}

document.getElementById('voltarBtn').onclick = function() {
  window.location.href = 'venda.html';
};

renderResumoCarrinho();