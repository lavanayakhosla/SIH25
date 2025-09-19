import React, { useState } from 'react';

export default function SearchBox({ onSearch }){
  const [q, setQ] = useState('');
  return (
    <div style={{width:'100%'}}>
      <div className="inputRow">
        <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search NAMASTE term (e.g., Gulma)" />
        <button className="btn" onClick={()=>onSearch(q)}>Search</button>
      </div>
    </div>
  );
}
