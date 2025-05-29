const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());

// Mock: devolve produção aleatória na raiz "/"
app.get('/', (req, res) => {
  const value = (Math.random() * 10 + 1).toFixed(2); // 1 a 11 kWh
  res.json({
    timestamp: new Date(),
    value: Number(value)
  });
});

app.listen(PORT, () => {
  console.log(`Mock Customer API running at http://localhost:${PORT}/`);
});