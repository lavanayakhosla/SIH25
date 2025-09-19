/**
 * Minimal terminology microservice prototype
 * Endpoints:
 * - GET /health
 * - GET /namaste/codesystem
 * - GET /search?q=
 * - POST /$translate
 * - POST /fhir/Bundle
 *
 * NOTE: Prototype — does NOT enforce ABHA OAuth (add in prod).
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { Client } = require('elasticsearch');
const config = require('./config');

const app = express();

// --- CORS middleware (added) ---
app.use(cors());              // Allow CORS for all routes
app.options('*', cors());     // Handle preflight requests globally

app.use(bodyParser.json({ limit: '10mb' }));

const es = new Client({ host: config.es.host });

// try load codesystem from samples
let NAMASTE_CODESYSTEM = null;
try {
  NAMASTE_CODESYSTEM = JSON.parse(fs.readFileSync(__dirname + '/samples/namaste_codesystem.json'));
} catch (e) { NAMASTE_CODESYSTEM = null; }

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', version: '0.1.0' }));

// Return NAMASTE CodeSystem if ingested
app.get('/namaste/codesystem', (req, res) => {
  if (!NAMASTE_CODESYSTEM) return res.status(404).json({ error: 'CodeSystem not ingested. Run ingest script.' });
  return res.json(NAMASTE_CODESYSTEM);
});

// Search/autocomplete powered by ES
app.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const size = Math.min(parseInt(req.query.limit || '20'), 100);
  if (!q) return res.json({ matches: [] });

  const body = {
    query: {
      multi_match: {
        query: q,
        fields: ['display^3', 'synonyms', 'definition'],
        fuzziness: 'AUTO'
      }
    },
    size
  };

  try {
    const r = await es.search({ index: config.es.index, body });
    const matches = r.hits.hits.map(h => ({
      score: h._score,
      code: h._source.code,
      display: h._source.display,
      synonyms: h._source.synonyms,
      system: config.namasteCodeSystemURI
    }));
    return res.json({ matches });
  } catch (err) {
    console.error('ES search error', err.message || err);
    return res.status(500).json({ error: 'search failed', detail: err.message });
  }
});

// $translate stub - returns candidate matches from ES (prototype)
app.post('/$translate', async (req, res) => {
  const params = req.body;
  if (!params || !Array.isArray(params.parameter) || !params.parameter.length) {
    return res.status(400).json({ error: 'expected FHIR Parameters with parameter array' });
  }
  const valueCoding = params.parameter[0].valueCoding;
  if (!valueCoding) return res.status(400).json({ error: 'expected valueCoding in parameter' });

  const q = valueCoding.code || valueCoding.display || '';
  const body = {
    query: {
      multi_match: {
        query: q,
        fields: ['code^4', 'display^3', 'synonyms', 'definition'],
        fuzziness: 'AUTO'
      }
    },
    size: 10
  };

  try {
    const r = await es.search({ index: config.es.index, body });
    const parameters = [{ name: 'source', valueCoding }];
    r.hits.hits.forEach(h => {
      parameters.push({
        name: 'candidate',
        valueString: JSON.stringify({
          namaste: { code: h._source.code, display: h._source.display },
          score: h._score
        })
      });
    });
    return res.json({ resourceType: 'Parameters', parameter: parameters });
  } catch (err) {
    console.error('translate error', err);
    return res.status(500).json({ error: 'translate failed', detail: err.message });
  }
});

// FHIR Bundle ingest - basic validation and provenance stub
app.post('/fhir/Bundle', (req, res) => {
  const bundle = req.body;
  if (!bundle || bundle.resourceType !== 'Bundle') {
    return res.status(400).json({ error: 'expected FHIR Bundle' });
  }

  const issues = [];
  (bundle.entry || []).forEach((entry, idx) => {
    if (entry.resource && entry.resource.resourceType === 'Condition') {
      const codings = entry.resource.code && entry.resource.code.coding || [];
      if (!codings.length) issues.push({ entry: idx, issue: 'Condition has no coding' });
      const hasNamaste = codings.some(c => c.system === config.namasteCodeSystemURI);
      if (!hasNamaste) issues.push({ entry: idx, issue: 'Condition missing NAMASTE coding' });
    }
  });

  const operationOutcome = {
    resourceType: 'OperationOutcome',
    issue: issues.length
      ? issues.map(i => ({ severity: 'error', details: { text: i.issue } }))
      : [{ severity: 'information', details: { text: 'Bundle accepted (prototype)' } }]
  };

  const provenance = {
    resourceType: 'Provenance',
    recorded: new Date().toISOString(),
    agent: [{ type: { text: 'software' }, who: { display: 'namaste-termservice (prototype)' } }]
  };

  return res.json({ outcome: operationOutcome, provenance });
});

// start server
app.listen(config.port, () =>
  console.log(`NAMASTE termservice running on http://localhost:${config.port}`)
);
