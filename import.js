// import.js
const fs = require('fs');
const axios = require('axios');

const PROD_URL = 'http://159.89.14.142:1337';
const ADMIN_JWT = 'e96706b328bb82e925ed45d2c11ec5734c6046078c9b761386c8f72579b4ed48ff26c7e0cfe06fb3edf8cef78c12ddd5fafd0b71ccd5966de5819d342cae4f3f321fd9c76adde54b18a13a3e116378a51b2eb866b68cddb0460db5fb5ec080655220742b7b133d43fc2d48bdae80df46891d2d66da7f1d6b1d049498c2f481a1'; // <-- sostituisci qui con il tuo Admin Token di produzione

async function main() {
  // leggi il file esportato
  const raw = fs.readFileSync('export-clients.json', 'utf-8');
  const clients = JSON.parse(raw).data;

  for (const item of clients) {
    const attrs = item.attributes;
    // 1) crea il client in prod
    const cRes = await axios.post(
      `${PROD_URL}/api/clients`,
      { data: {
          name: attrs.name,
          domain: attrs.domain,
          token: attrs.token,
          cookie_status: attrs.cookie_status
      }},
      { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
    );
    const newClientId = cRes.data.data.id;

    // 2) per ogni cookie collegato
    for (const rel of attrs.cookies.data) {
      const c = rel.attributes;
      // crea il cookie
      const ckRes = await axios.post(
        `${PROD_URL}/api/cookies`,
        { data: {
            name: c.name,
            domain: c.domain,
            purpose: c.purpose,
            duration: c.duration,
            category: c.category
        }},
        { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
      );
      const newCookieId = ckRes.data.data.id;

      // collega quel cookie al client
      await axios.put(
        `${PROD_URL}/api/clients/${newClientId}`,
        { data: { cookies: [ newCookieId ] } },
        { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
      );
    }

    console.log(`✅ Importato client "${attrs.name}" con ID ${newClientId}`);
  }
}

main().catch(err => {
  console.error("❌ Errore durante import:", err.response?.data || err.message);
  process.exit(1);
});
