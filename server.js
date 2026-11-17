const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use((req, res, next) => {
  if (
    req.path === '/book-mobile' ||
    req.path.startsWith('/book-mobile/') ||
    req.path.startsWith('/node_modules/') ||
    req.path.startsWith('/.git') ||
    req.path.startsWith('/.agents') ||
    req.path === '/package.json' ||
    req.path === '/package-lock.json' ||
    req.path === '/server.js'
  ) {
    return res.status(404).send('Not found');
  }
  next();
});

app.use(
  express.static(__dirname, {
    extensions: ['html'],
    dotfiles: 'ignore',
    setHeaders: (res, filePath) => {
      if (/\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    },
  })
);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Interactive Math Book server listening at http://${HOST}:${PORT}`);
});
