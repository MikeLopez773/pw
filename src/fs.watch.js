const fs = require('fs');

fs.watch('./src/models', (eventType, filename) => {
  if (filename) {
    console.log(`Arquivo alterado: ${filename}`);
  }
});