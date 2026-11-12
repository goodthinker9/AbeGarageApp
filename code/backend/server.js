// Entry point – starts the HTTP server.
// app.js is kept separate so tests can import it without binding a port.
'use strict';

const app  = require('./app');
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
