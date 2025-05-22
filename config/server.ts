export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    // In locale usiamo due chiavi di default, in produzione
    // Railway passerà APP_KEYS via env (virgola-separate)
    keys: env.array('APP_KEYS', [
      'devKey1_changeMe', 
      'devKey2_changeMe'
    ]),
  },
});
