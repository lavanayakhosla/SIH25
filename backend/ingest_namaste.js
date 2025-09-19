/**
 * Read NAMASTE CSV and:
 * - Produce a FHIR CodeSystem JSON file
 * - Index each term into Elasticsearch for search/autocomplete
 *
 * Usage: node ingest_namaste.js samples/namaste_sample.csv
 */

/**
 * Read NAMASTE CSV and:
 * - Produce a FHIR CodeSystem JSON file
 * - Index each term into Elasticsearch for search/autocomplete
 *
 * Usage: node ingest_namaste.js samples/namaste_sample.csv
 */
const fs = require('fs');
const { parse } = require('csv-parse');   // ✅ FIXED
const { Client } = require('elasticsearch');
const config = require('./config');

const es = new Client({ host: config.es.host });
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node ingest_namaste.js path/to/namaste.csv');
  process.exit(1);
}

const rows = [];
fs.createReadStream(csvPath)
  .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
  .on('data', row => rows.push(row))
  .on('end', async () => {
    console.log('Rows parsed:', rows.length);

    const codeSystem = {
      resourceType: 'CodeSystem',
      id: 'NAMASTE-codesystem-proto',
      url: config.namasteCodeSystemURI,
      version: new Date().toISOString().slice(0, 10),
      name: 'NAMASTE',
      status: 'active',
      content: 'complete',
      concept: []
    };

    const bulk = [];
    rows.forEach(r => {
      const code = (r.code || r.Code || '').trim();
      const display = (r.preferredLabel || r.display || r.PreferredLabel || '').trim() || code;
      const definition = (r.definition || r.Definition || '').trim() || '';
      const synonyms = (r.synonyms || r.Synonyms || '').trim() || '';
      if (!code) return;

      codeSystem.concept.push({ code, display, definition });
      bulk.push({ index: { _index: config.es.index, _id: code } });
      bulk.push({ code, display, definition, synonyms, source: 'namaste' });
    });

    // write codesystem file
    fs.mkdirSync(__dirname + '/samples', { recursive: true });
    fs.writeFileSync(
      __dirname + '/samples/namaste_codesystem.json',
      JSON.stringify(codeSystem, null, 2)
    );
    console.log('Wrote samples/namaste_codesystem.json');

    // ensure ES index exists and mapping
    try {
      const exists = await es.indices.exists({ index: config.es.index });
      if (!exists) {
        await es.indices.create({
          index: config.es.index,
          body: require('../es_mapping.json')
        });
        console.log('Created ES index', config.es.index);
      }
    } catch (e) {
      console.warn('ES index create attempt failed (may already exist):', e.message || e);
    }

    // bulk index
    if (bulk.length) {
      try {
        const resp = await es.bulk({ body: bulk });
        console.log('ES bulk indexed. Items:', resp.items.length);
      } catch (e) {
        console.error('ES bulk error', e);
      }
    }

    console.log('Ingest complete.');
  });
