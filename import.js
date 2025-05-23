// import.js
const fs    = require('fs');
const axios = require('axios');

// URL del tuo Strapi in produzione (Droplet)
const PROD_URL = 'http://159.89.14.142:1337';

// Sostituisci questo con **TUTTO** il token che ti ha restituito il curl,
// SENZA puntini di sospensione e senza andare a capo:
const ADMIN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQ4MDI2ODg5LCJleHAiOjE3NTA2MTg4ODl9.SY8yTrvGGBDZbrEkAEVbCkFPUk8FiKmhzou-S_lCA8s';


async function main() {
  // 1) Leggi il JSON esportato
  const raw     = fs.readFileSync('export-clients.json', 'utf-8');
  const clients = JSON.parse(raw).data;

  for (const item of clients) {
    // destruttura i campi direttamente
    const { name, domain, token, cookie_status, cookies } = item;

    // 2) crea il client
    const cRes = await axios.post(
      `${PROD_URL}/api/clients`,
      { data: { name, domain, token, cookie_status } },
      { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
    );
    const newClientId = cRes.data.data.id;

    // 3) crea i cookie e raccogli i loro ID
    const newCookieIds = [];
    for (const c of cookies) {
      const { name: ckName, domain: ckDomain, purpose, duration, category } = c;
      const ckRes = await axios.post(
        `${PROD_URL}/api/cookies`,
        { data: { name: ckName, domain: ckDomain, purpose, duration, category } },
        { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
      );
      newCookieIds.push(ckRes.data.data.id);
      console.log(`    → creato cookie "${ckName}" (ID ${ckRes.data.data.id})`);
    }

    // 4) collega tutti i cookie in un’unica chiamata
    await axios.put(
      `${PROD_URL}/api/clients/${newClientId}`,
      { data: { cookies: newCookieIds } },
      { headers: { Authorization: `Bearer ${ADMIN_JWT}` } }
    );

    console.log(`✅ Importato client "${name}" (ID ${newClientId}) con cookie [${newCookieIds.join(', ')}]`);
  }

  console.log('🎉 Import completato!');
}

main().catch(err => {
  console.error('❌ Errore durante import:', err.response?.data || err.message);
  process.exit(1);
});
