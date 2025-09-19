/**
 * Prototype sync worker that simulates fetching ICD-11 TM2 candidates
 * for NAMASTE terms and writes a sample ConceptMap JSON.
 *
 * Replace simulated logic with real WHO ICD-11 API calls in production.
 */
const fs = require('fs');
const config = require('./config');

(async () => {
  const csPath = __dirname + '/samples/namaste_codesystem.json';
  if (!fs.existsSync(csPath)) { console.error('CodeSystem not found. Run ingest first.'); process.exit(1); }
  const cs = JSON.parse(fs.readFileSync(csPath));
  const elements = [];

  for (let i = 0; i < Math.min(200, (cs.concept || []).length); i++) {
    const c = cs.concept[i];
    const fakeTm2 = 'TM2_' + Buffer.from(c.code).toString('hex').slice(0,6).toUpperCase();
    elements.push({
      code: c.code,
      display: c.display,
      target: [{ code: fakeTm2, display: `Simulated TM2 match for ${c.display}`, equivalence: 'equivalent', comment: 'auto-generated candidate' }]
    });
  }

  const conceptMap = {
    resourceType: 'ConceptMap',
    id: 'namaste-to-tm2-proto',
    url: 'urn:uuid:namaste-to-tm2-proto',
    version: new Date().toISOString(),
    sourceUri: config.namasteCodeSystemURI,
    targetUri: config.who.tm2System,
    group: [{
      source: config.namasteCodeSystemURI,
      target: config.who.tm2System,
      element: elements
    }]
  };

  fs.writeFileSync(__dirname + '/samples/sample_conceptmap.json', JSON.stringify(conceptMap, null, 2));
  console.log('Wrote samples/sample_conceptmap.json with', elements.length, 'candidates (simulated).');
})();
