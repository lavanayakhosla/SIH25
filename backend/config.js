module.exports = {
    port: process.env.PORT || 3000,
    pg: {
      connectionString: process.env.PG_CONN || 'postgres://postgres:postgres@localhost:5432/namaste'
    },
    es: {
      host: process.env.ES_HOST || 'http://localhost:9200',
      index: process.env.ES_INDEX || 'namaste_terms'
    },
    namasteCodeSystemURI: 'https://namaste.ayush.gov.in/codesystem/NAMASTE',
    who: {
      baseUrl: process.env.WHO_BASE || 'https://id.who.int/icd/release/11',
      tm2System: 'https://icd.who.int/tm2',
      biomedicalSystem: 'https://icd.who.int/icd/release/11/mms'
    }
  };
  

  