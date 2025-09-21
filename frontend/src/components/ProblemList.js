import React from 'react';

export default function ProblemList({ items, onRemove }){
  if (!items.length) return (
    <div className="card problemList">
      <h3>Problem List</h3>
      <div style={{padding:20, textAlign:'center', color:'#666'}}>
        <p>No problems added yet. Search and translate terms to add them to your problem list.</p>
      </div>
    </div>
  );
  
  return (
    <div className="card problemList">
      <h3>Problem List ({items.length})</h3>
      <div style={{marginBottom:15, fontSize:14, color:'#666'}}>
        Translated NAMASTE terms with their corresponding ICD-11 mappings
      </div>
      {items.map((p, idx)=> (
        <div key={idx} className="problem-item">
          <div style={{flex:1}}>
            <div style={{marginBottom:5}}>
              <strong style={{color:'var(--primary-green)', fontSize:16}}>{p.display}</strong>
              <span style={{color:'#666', marginLeft:10, fontSize:12}}>({p.code})</span>
            </div>
            <div style={{fontSize:13,color:'#666'}}>
              <span style={{fontWeight:500}}>ICD-11:</span> {p.icdDisplay ? p.icdDisplay : 'No mapping available'}
            </div>
          </div>
          <div>
            <button 
              className="smallBtn" 
              onClick={()=>onRemove(idx)}
              style={{backgroundColor:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2'}}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
