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

  // Validação número do cartão (Luhn)
  const numero = this.querySelector('[autocomplete="cc-number"]').value.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(numero) || !luhnCheck(numero)) {
    document.getElementById('pagamentoMensagem').innerText = "Número de cartão inválido.";
    return;
  }

  // Validação validade (MM/AA)
  const validade = this.querySelector('[autocomplete="cc-exp"]').value;
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
    document.getElementById('pagamentoMensagem').innerText = "Validade inválida.";
    return;
  }

  // Validação CVC (3 ou 4 dígitos numéricos)
  const cvc = this.querySelector('[autocomplete="cc-csc"]').value;
  if (!/^\d{3,4}$/.test(cvc)) {
    document.getElementById('pagamentoMensagem').innerText = "CVC inválido (só números).";
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

// BLOQUEAR NÚMEROS NO NOME DO CARTÃO
document.querySelector('[autocomplete="cc-name"]').addEventListener('input', function (e) {
  this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
});

// BLOQUEAR LETRAS E SÍMBOLOS NO NÚMERO DO CARTÃO
document.querySelector('[autocomplete="cc-number"]').addEventListener('input', function (e) {
  this.value = this.value.replace(/[^0-9]/g, '');
});

// FORMATAR VALIDADE PARA MM/AA E BLOQUEAR LETRAS/SÍMBOLOS
document.querySelector('[autocomplete="cc-exp"]').addEventListener('input', function (e) {
  let val = this.value.replace(/[^\d]/g, '');
  if (val.length >= 3) {
    val = val.slice(0, 2) + '/' + val.slice(2, 4);
  }
  this.value = val.slice(0, 5);
});

// BLOQUEAR LETRAS E SÍMBOLOS NO CVC (só números)
document.querySelector('[autocomplete="cc-csc"]').addEventListener('input', function (e) {
  this.value = this.value.replace(/[^0-9]/g, '');
});