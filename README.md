### Renewable Energy Management Application

Este projeto é uma aplicação para gestão de energia renovável, permitindo aos utilizadores monitorizar a produção de energia, gerir créditos energéticos e configurar autenticação de dois fatores (MFA) para maior segurança.

---

### **Estrutura do Projeto**

```
renewable-energy-management-app/
├── .env
├── libssl1.1_1.1.1f-1ubuntu2_amd64.deb
├── package.json
├── README.md
├── users.json
├── public/
│   ├── alterar-password.html
│   ├── style.css
│   ├── utils.js
│   ├── dashboard-admin/
│   │   ├── admin_css.css
│   │   ├── admin_js.js
│   │   ├── admin-dashboard.html
│   │   ├── gestão-utilizadores.html
│   │   └── criar.utilizador.html
│   ├── dashboard-cliente/
│   │   ├── cliente_css.css
│   │   ├── cliente_js.js
│   │   ├── cliente-dashboard.html
│   │   ├── registar-painel.html
│   │   ├── meus-paineis.html
│   │   ├── historico-produção.html
│   │   └── creditos-energia.html
│   ├── dashboard-gestor/
│   │   ├── gestor_js.js
│   │   ├── gestor-dashboard.html
│   ├── dashboard-tecnico/
│   │   ├── tecnico_css.css
│   │   ├── tecnico_js.js
│   │   ├── tecnico-dashboard.html
│   ├── login_web/
│   │   ├── login.html
│   │   ├── mfa.html
│   │   ├── setup-mfa.html
│   │   ├── mfa_css.css
│   │   ├── mfa_js.js
│   └── pagina_web/
│       ├── front.html
│       ├── front_css.css
│       ├── venda.html
│       ├── venda_js.js
│       ├── venda_css.css
│       ├── pagamento.html
│       ├── pagamento_js.js
│       ├── pagamento_css.css
│       ├── gestao.html
│       ├── gestao_js.js
│       ├── gestao_css.css
│       ├── instalacao.html
│       └── instalacao_css.css
├── src/
│   ├── app.js
│   ├── config.js
│   ├── fs.watch.js
│   ├── controllers/
│   │   ├── solarPanelController.js
│   │   ├── energyMonitorController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   ├── solarPanel.js
│   │   ├── energyProduction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── solarPanelRoutes.js
│   │   ├── energyMonitorRoutes.js
│   ├── services/
│   │   ├── mfaService.js
│   └── utils/
│       ├── validators.js
├── uploads/
│   └── certificates/
```

---

### Tecnologias

- **Backend**: Node.js, Express.js
- **Base de Dados**: MongoDB
- **Autenticação**: JSON Web Tokens (JWT) e Google Authenticator (MFA)
- **Frontend**: HTML, CSS, JavaScript
- **Outras Bibliotecas**:
  - `bcryptjs`: Para hashing de passwords
  - `speakeasy`: Para geração e verificação de códigos MFA
  - `qrcode`: Para geração de QR Codes
  - `multer`: Para upload de ficheiros
- **Ferramentas de Desenvolvimento**:
  - `nodemon`: Para reinício automático do servidor durante o desenvolvimento
  - `dotenv`: Para gestão de variáveis de ambiente

---

## **Funcionalidades Principais**

1. **Autenticação de Utilizadores**:
   - Registo e login com JWT.
   - Suporte para autenticação de dois fatores (MFA) com Google Authenticator.

2. **Gestão de Painéis Solares**:
   - Registo de painéis solares.
   - Monitorização da produção de energia em tempo real.
   - Certificação de painéis solares (apenas para técnicos).

3. **Gestão de Créditos Energéticos**:
   - Consulta de créditos energéticos acumulados.
   - Histórico de créditos por mês.

4. **Gestão de Utilizadores**:
   - Criação, edição e remoção de utilizadores (apenas para administradores).
   - Suporte para diferentes roles: `admin`, `tecnico`, `gestor`, `cliente`.

5. **Configuração de MFA**:
   - Geração de QR Code para configuração no Google Authenticator.
   - Verificação de códigos MFA durante o login.

---

## **Configuração do Projeto**

1. **Pré-requisitos**:
   - Node.js (v18 ou superior)
   - MongoDB

2. **Instalação**:
   ```bash
   git clone https://github.com/MikeLopez773/pw.git
   cd renewable-energy-management-app
   npm install
   ```

---

### Considerações de Segurança

- **Variáveis de Ambiente**: Armazenar informações sensíveis como segredo JWT e strings de conexão da base de dados em variáveis de ambiente.
- **Validação de Entrada**: Validar as entradas do utilizador para prevenir injeções e outros ataques.
- **HTTPS**: Usar HTTPS para transmissão segura de dados.
- **Limitação de Taxa**: Implementar limitação de taxa para prevenir abusos da API.

---

### Usabilidade e Desempenho

- **Framework Frontend**: Considerar o uso de um framework frontend como React ou Vue.js para uma melhor experiência do utilizador.
- **Cache**: Implementar estratégias de cache para dados frequentemente acedidos.
- **Teste de Carga**: Realizar testes de carga para garantir que a aplicação pode suportar alto tráfego.

---

### Escalabilidade e Manutenção

- **Microserviços**: Considerar dividir a aplicação em microserviços para melhor escalabilidade.
- **Documentação**: Manter uma documentação clara para a API e base de código.
- **Teste**: Implementar testes unitários e de integração para garantir a qualidade do código.

---

### Conclusão

Esta estrutura de projeto fornece uma base sólida para construir uma aplicação de gestão de energia renovável. Pode ser expandida com funcionalidades como papéis de utilizador, notificações e uma contabilização de créditos de energia mais detalhada. Mantenha sempre em mente a segurança, desempenho e experiência do utilizador enquanto desenvolve a aplicação.