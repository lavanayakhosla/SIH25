import React from 'react';

export default function ResultsList({ items, onTranslate }){
  if (!items.length) return (
    <div style={{padding:20, textAlign:'center', color:'#666'}}>
      <p>No matches found. Try searching with different keywords.</p>
    </div>
  );
  
  return (
    <div>
      <div style={{marginBottom:15, fontSize:14, color:'#666'}}>
        Found {items.length} result{items.length !== 1 ? 's' : ''}
      </div>
      {items.map(it => (
        <div key={it.code} className="resultItem">
          <div style={{flex:1}}>
            <div style={{marginBottom:5}}>
              <strong style={{color:'var(--primary-green)', fontSize:16}}>{it.display}</strong>
              <span style={{color:'#666', marginLeft:10, fontSize:12}}>({it.code})</span>
            </div>
            {it.synonyms && (
              <div style={{fontSize:13,color:'#666', fontStyle:'italic'}}>
                Synonyms: {it.synonyms}
              </div>
            )}
          </div>
          <div>
            <button className="smallBtn" onClick={()=>onTranslate(it)}>
              Translate to ICD-11
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
