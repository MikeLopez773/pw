// Verifica autenticação antes de permitir pagamento
(function checkAuth() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Por favor, autentique-se para efetuar compras.');
    window.location.href = '/login_web/login.html';
  }
})();

// Modelos de painéis solares (exemplo)
const produtos = [
  {
    id: 1,
    nome: "Painel Solar 350W Monocristalino",
    descricao: "Alta eficiência, ideal para residências. 25 anos de garantia.",
    preco: 199.99,
    imagem: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    nome: "Painel Solar 410W Bifacial",
    descricao: "Capta energia em ambos os lados. Excelente para telhados planos.",
    preco: 259.99,
    imagem: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    nome: "Painel Solar 500W Premium",
    descricao: "Máxima produção para grandes instalações. Tecnologia de ponta.",
    preco: 349.99,
    imagem: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80"
  }
];

let carrinho = [];

function renderProdutos() {
  const produtosDiv = document.getElementById('produtos');
  produtosDiv.innerHTML = '';
  produtos.forEach(produto => {
    produtosDiv.innerHTML += `
      <div class="produto">
        <img src="${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <div class="preco">${produto.preco.toFixed(2)} €</div>
        <button onclick="adicionarCarrinho(${produto.id})">Adicionar ao Carrinho</button>
      </div>
    `;
  });
}

window.adicionarCarrinho = function(id) {
  const produto = produtos.find(p => p.id === id);
  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    existente.qtd += 1;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }
  renderCarrinho();
};

function renderCarrinho() {
  const carrinhoDiv = document.getElementById('carrinho');
  if (carrinho.length === 0) {
    carrinhoDiv.innerHTML = "<p>O seu carrinho está vazio.</p>";
    document.getElementById('checkout').style.display = "none";
    return;
  }
  let html = "<ul>";
  carrinho.forEach(item => {
    html += `<li>
      ${item.nome} x${item.qtd} - ${(item.preco * item.qtd).toFixed(2)} €
      <button class="remover" onclick="removerCarrinho(${item.id})">Remover</button>
    </li>`;
  });
  html += "</ul>";
  const total = carrinho.reduce((sum, item) => sum + item.preco * item.qtd, 0);
  html += `<div class="carrinho-total">Total: ${total.toFixed(2)} €</div>`;
  html += `<button class="carrinho-comprar" onclick="mostrarCheckout()">Finalizar Compra</button>`;
  carrinhoDiv.innerHTML = html;
}

window.removerCarrinho = function(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  renderCarrinho();
};

window.mostrarCheckout = function() {
  if (carrinho.length === 0) return;
  // Guarda o carrinho no sessionStorage para usar na página de pagamento
  sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
  window.location.href = 'pagamento.html';
};

document.getElementById('pagamentoForm').onsubmit = function(e) {
  e.preventDefault();
  document.getElementById('pagamentoMensagem').innerText = "Pagamento efetuado com sucesso! Obrigado pela sua compra.";
  carrinho = [];
  renderCarrinho();
  setTimeout(() => {
    document.getElementById('pagamentoMensagem').innerText = "";
    document.getElementById('checkout').style.display = "none";
  }, 3500);
};

document.getElementById('voltarBtn').onclick = function() {
  window.location.href = 'front.html';
};

renderProdutos();
renderCarrinho();