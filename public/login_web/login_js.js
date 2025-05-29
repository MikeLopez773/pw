// Alternar entre login e registo
const loginForm = document.getElementById('loginForm'); // Formulário de login
const registerForm = document.getElementById('registerForm'); // Formulário de registo
const showRegister = document.getElementById('showRegister'); // Botão para mostrar o formulário de registo
const showLogin = document.getElementById('showLogin'); // Botão para mostrar o formulário de login
const formTitle = document.getElementById('formTitle'); // Título do formulário
const loginMessage = document.getElementById('loginMessage'); // Mensagem de feedback para login
const registerMessage = document.getElementById('registerMessage'); // Mensagem de feedback para registo

// Mostrar o formulário de registo
showRegister.onclick = () => {
  loginForm.style.display = 'none'; // Esconde o formulário de login
  showRegister.style.display = 'none'; // Esconde o botão "Criar Conta"
  registerForm.style.display = 'flex'; // Mostra o formulário de registo
  showLogin.style.display = 'block'; // Mostra o botão "Já tem conta? Faça login"
  formTitle.textContent = 'Criar Conta'; // Atualiza o título do formulário
  loginMessage.textContent = ''; // Limpa mensagens de feedback do login
};

// Mostrar o formulário de login
showLogin.onclick = () => {
  loginForm.style.display = 'flex'; // Mostra o formulário de login
  showRegister.style.display = 'block'; // Mostra o botão "Criar Conta"
  registerForm.style.display = 'none'; // Esconde o formulário de registo
  showLogin.style.display = 'none'; // Esconde o botão "Já tem conta? Faça login"
  formTitle.textContent = 'Login'; // Atualiza o título do formulário
  registerMessage.textContent = ''; // Limpa mensagens de feedback do registo
};

// Função para autenticar o utilizador
async function loginUser(username, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    
    // ADICIONAR ESTE DEBUG:
    console.log('🔍 Resposta do login:', data);
    console.log('🔍 Token recebido:', data.token);
    console.log('🔍 Tipo do token:', typeof data.token);
    
    if (res.ok) {
      // Salvar token
      sessionStorage.setItem('token', data.token);
      
      // VERIFICAR SE FOI SALVO CORRETAMENTE:
      const savedToken = sessionStorage.getItem('token');
      console.log('✅ Token salvo:', savedToken);
      console.log('✅ Tokens são iguais?', data.token === savedToken);
      
      // Redirecionar baseado no role
      if (data.user.role === 'admin') {
        window.location.href = '../dashboard-admin/admin-dashboard.html';
      } else if (data.user.role === 'tecnico') {
        window.location.href = '../dashboard-tecnico/tecnico-dashboard.html';
      } else if (data.user.role === 'gestor') {
        window.location.href = '../dashboard-gestor/gestor-dashboard.html';
      } else {
        window.location.href = '../dashboard-cliente/cliente-dashboard.html';
      }
    } else {
      loginMessage.style.color = "#e53935";
      loginMessage.textContent = data.message || 'Erro no login';
    }
  } catch (error) {
    console.error('Erro no login:', error);
    loginMessage.textContent = 'Erro de ligação ao servidor';
  }
}

// Evento de submissão do formulário de login
loginForm.onsubmit = async (e) => {
  e.preventDefault(); // Impede o comportamento padrão do formulário
  loginMessage.textContent = 'A autenticar...'; // Exibe mensagem de feedback
  const username = document.getElementById('loginUsername').value; // Obtém o username
  const password = document.getElementById('loginPassword').value; // Obtém a password
  try {
    await loginUser(username, password); // Chama a função de login
  } catch (err) {
    // Exibe mensagem de erro em caso de falha na ligação ao servidor
    loginMessage.textContent = 'Erro de ligação ao servidor';
  }
};

// Evento de submissão do formulário de registo
registerForm.onsubmit = async (e) => {
  e.preventDefault(); // Impede o comportamento padrão do formulário
  registerMessage.textContent = 'A registar...'; // Exibe mensagem de feedback
  const username = document.getElementById('registerUsername').value; // Obtém o username
  const password = document.getElementById('registerPassword').value; // Obtém a password
  const email = document.getElementById('registerEmail').value; // Obtém o email
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', // Método HTTP POST
      headers: { 'Content-Type': 'application/json' }, // Cabeçalhos da requisição
      body: JSON.stringify({ username, password, email }) // Corpo da requisição com os dados do utilizador
    });
    const data = await res.json(); // Converte a resposta para JSON
    if (res.ok) {
      // Exibe mensagem de sucesso no registo
      registerMessage.style.color = "#388e3c"; // Cor verde para sucesso
      registerMessage.textContent = 'Conta criada com sucesso! Faça login.';
      setTimeout(() => {
        registerForm.reset(); // Limpa o formulário
        showLogin.onclick(); // Alterna para o formulário de login
        registerMessage.textContent = ''; // Limpa a mensagem de feedback
      }, 1500);
    } else {
      // Exibe mensagem de erro no registo
      registerMessage.style.color = "#e53935"; // Cor vermelha para erro
      registerMessage.textContent = data.message || 'Erro ao criar conta';
    }
  } catch (err) {
    // Exibe mensagem de erro em caso de falha na ligação ao servidor
    registerForm.reset(); // Limpa o formulário
    registerMessage.style.color = "#e53935"; // Cor vermelha para erro
    registerMessage.textContent = 'Erro de ligação ao servidor';
  }
};