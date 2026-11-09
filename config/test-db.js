const pool = require('./db');
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log(rows); // attendu : [ { ok: 1 } ]
  } catch (error) {
    console.error('Connexion SQL impossible :', error.message);
  } finally {
    await pool.end();
  }
})();
