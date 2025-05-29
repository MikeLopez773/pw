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
│       ├── Intalacao.html
│       └── instalacao_css.css
├── src/
│   ├── app.js
│   ├── config.js
│   ├── fs.watch.js
│   ├── controllers/
│   │   ├── solarPanelController.js
│   │   ├── energyMonitorController.js
│   └── middleware/
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
   git clone https://github.com/seu-repositorio/renewable-energy-management-app.git
   cd renewable-energy-management-app
   npm install
   ```

### Principais Funcionalidades

1. **Autenticação de Utilizador**: Os utilizadores podem registar-se e iniciar sessão utilizando JWT para sessões seguras.
2. **Registo de Painéis Solares**: Os utilizadores podem registar as suas instalações de painéis solares.
3. **Monitorização de Energia em Tempo Real**: Os utilizadores podem monitorizar a produção de energia através de uma API.
4. **Contabilização de Créditos de Energia**: Os utilizadores podem acompanhar os seus créditos de energia com base na produção.

### Código Exemplo

#### 1. Configuração do Servidor (`server/server.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const panelRoutes = require('./routes/panels');
const energyRoutes = require('./routes/energy');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB(); // Conectar ao MongoDB

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/energy', energyRoutes);

app.listen(PORT, () => console.log(`Servidor a correr em http://localhost:${PORT}`));
```

#### 2. Configuração da Base de Dados (`server/config/db.js`)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/renewable_energy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Erro na conexão ao MongoDB:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

#### 3. Modelo de Utilizador (`server/models/User.js`)

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  panels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Panel' }],
});

module.exports = mongoose.model('User', UserSchema);
```

#### 4. Rotas de Autenticação (`server/routes/auth.js`)

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const SECRET = 'your_jwt_secret'; // Usar variáveis de ambiente em produção

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'Utilizador registado com sucesso' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
```

#### 5. Modelo de Painel Solar (`server/models/Panel.js`)

```javascript
const mongoose = require('mongoose');

const PanelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  installationDate: { type: Date, required: true },
  capacity: { type: Number, required: true }, // em kW
  productionData: [{ timestamp: Date, production: Number }], // Dados em tempo real
});

module.exports = mongoose.model('Panel', PanelSchema);
```

#### 6. Rotas de Monitorização de Energia (`server/routes/energy.js`)

```javascript
const express = require('express');
const Panel = require('../models/Panel');
const router = express.Router();

// Middleware para autenticar utilizador
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:panelId', authMiddleware, async (req, res) => {
  const panel = await Panel.findById(req.params.panelId);
  if (!panel) return res.status(404).json({ message: 'Painel não encontrado' });
  res.json(panel.productionData);
});

router.post('/:panelId/data', authMiddleware, async (req, res) => {
  const { production } = req.body;
  const panel = await Panel.findById(req.params.panelId);
  if (!panel) return res.status(404).json({ message: 'Painel não encontrado' });
  panel.productionData.push({ timestamp: new Date(), production });
  await panel.save();
  res.json({ message: 'Dados de produção adicionados' });
});

module.exports = router;
```

### Considerações de Segurança

- **Variáveis de Ambiente**: Armazenar informações sensíveis como segredo JWT e strings de conexão da base de dados em variáveis de ambiente.
- **Validação de Entrada**: Validar as entradas do utilizador para prevenir injeções SQL e outros ataques.
- **HTTPS**: Usar HTTPS para transmissão segura de dados.
- **Limitação de Taxa**: Implementar limitação de taxa para prevenir abusos da API.

### Usabilidade e Desempenho

- **Framework Frontend**: Considerar o uso de um framework frontend como React ou Vue.js para uma melhor experiência do utilizador.
- **Cache**: Implementar estratégias de cache para dados frequentemente acedidos.
- **Teste de Carga**: Realizar testes de carga para garantir que a aplicação pode suportar alto tráfego.

### Escalabilidade e Manutenção

- **Microserviços**: Considerar dividir a aplicação em microserviços para melhor escalabilidade.
- **Documentação**: Manter uma documentação clara para a API e base de código.
- **Teste**: Implementar testes unitários e de integração para garantir a qualidade do código.

### Conclusão

Esta estrutura de projeto e snippets de código fornecem uma base sólida para construir uma aplicação de gestão de energia renovável. Você pode expandir isso adicionando funcionalidades como papéis de utilizador, notificações e uma contabilização de créditos de energia mais detalhada. Mantenha sempre em mente a segurança, desempenho e experiência do utilizador enquanto desenvolve a aplicação.
# pw