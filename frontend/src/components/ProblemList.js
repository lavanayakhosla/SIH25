import React from 'react';

export default function ProblemList({ items, onRemove }){
  if (!items.length) return <div style={{padding:12}}>Problem list empty</div>;
  return (
    <div className="card problemList">
      <h3>Problem List</h3>
      {items.map((p, idx)=> (
        <div key={idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
          <div>
            <div><strong>{p.display}</strong> <small>({p.code})</small></div>
            <div style={{fontSize:13,color:'#666'}}>{p.icdDisplay ? `TM2: ${p.icdDisplay}` : 'TM2: (none)'}</div>
          </div>
          <div>
            <button className="smallBtn" onClick={()=>onRemove(idx)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
