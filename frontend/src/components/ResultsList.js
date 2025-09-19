import React from 'react';

export default function ResultsList({ items, onTranslate }){
  if (!items.length) return <div style={{padding:12}}>No matches</div>;
  return (
    <div>
      {items.map(it => (
        <div key={it.code} className="resultItem">
          <div>
            <div><strong>{it.display}</strong> <span style={{color:'#666'}}>({it.code})</span></div>
            <div style={{fontSize:13,color:'#666'}}>{it.synonyms}</div>
          </div>
          <div>
            <button className="smallBtn" onClick={()=>onTranslate(it)}>Translate</button>
          </div>
        </div>
      ))}
    </div>
  );
}
