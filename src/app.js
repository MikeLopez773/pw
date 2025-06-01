const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Configurar dotenv para carregar variáveis de ambiente do ficheiro .env na raiz do projeto
dotenv.config();

// Importar a função que conecta à base de dados
const { connectDB } = require('./config');

// Importar as rotas
const authRoutes = require('./routes/authRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const energyMonitorRoutes = require('./routes/energyMonitorRoutes');
const creditRoutes = require('./routes/creditRoutes'); // ADICIONAR ESTA LINHA
const solarPanelRoutes = require('./routes/solarPanelRoutes');

// Inicializar a aplicação Express
const app = express();

// Ler a porta da variável de ambiente ou usar 3000 por defeito
const PORT = process.env.PORT || 3000;

// Conectar à base de dados antes de iniciar o servidor
connectDB()
  .then(() => {
    console.log('Conexão à base de dados estabelecida com sucesso.');

    // Middleware para permitir CORS (Cross-Origin Resource Sharing)
    app.use(cors());

    // Middleware para parse do body em JSON
    app.use(bodyParser.json());

    // Middleware para exibir logs no terminal
    app.use(morgan('dev'));

    // Servir ficheiros estáticos (ex: CSS, JS, imagens) da pasta "public"
    app.use(express.static(path.join(__dirname, '../public')));

    // Rota raiz - Serve o ficheiro front.html
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/pagina_web/front.html'));
    });

    // ROTA DE TESTE TEMPORÁRIA
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Rota de teste funcionando!' });
    });

    // ADICIONAR logs para debug:
    console.log('📋 Registrando rotas...');

    // Verificar se as rotas foram importadas corretamente
    console.log('🔍 Verificando imports:');
    console.log('   authRoutes:', typeof authRoutes);
    console.log('   panelRoutes:', typeof panelRoutes);
    console.log('   monitoringRoutes:', typeof monitoringRoutes);
    console.log('   energyMonitorRoutes:', typeof energyMonitorRoutes);
    console.log('   creditRoutes:', typeof creditRoutes);
    console.log('   solarPanelRoutes:', typeof solarPanelRoutes);

    // Usar as rotas
    app.use('/api/auth', authRoutes);
    app.use('/api/monitoring', monitoringRoutes);
    app.use('/api/energy', energyMonitorRoutes);
    app.use('/api/credit', creditRoutes);
    app.use('/api/panels', solarPanelRoutes);    // <-- Esta linha é obrigatória!

    console.log('✅ Rotas registradas:');
    console.log('   /api/auth - Autenticação');
    console.log('   /api/panels - Painéis solares');
    console.log('   /api/monitoring - Monitorização');
    console.log('   /api/energy - Histórico de energia');
    console.log('   /api/credit - Créditos de energia');
    console.log('   /api/solar - Gestão de painéis solares');

    // Rota catch-all (deve ser a última)
    app.use('/api/*', (req, res) => {
      console.log('❌ Rota não encontrada:', req.originalUrl);
      res.status(404).json({ message: `Rota ${req.originalUrl} não encontrada` });
    });

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error('Erro ao conectar à base de dados:', err);
  });

// Exportar a app para testes ou uso externo (opcional)
module.exports = app;

