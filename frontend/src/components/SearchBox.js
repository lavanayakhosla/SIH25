import React, { useState } from 'react';

export default function SearchBox({ onSearch }){
  const [q, setQ] = useState('');
  
  const handleSearch = () => {
    if (q.trim()) {
      onSearch(q);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{width:'100%'}}>
      <div className="inputRow">
        <input 
          className="input" 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Search NAMASTE term (e.g., Gulma, Jwara, Kasa)" 
        />
        <button className="btn" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
}
