import React, { useState } from "react";
import SearchBox from "./components/SearchBox";
import ResultsList from "./components/ResultsList";
import ProblemList from "./components/ProblemList";
import { searchTerms, translateValueCoding, uploadBundle } from "./api";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [problemList, setProblemList] = useState([]);
  const [bundleJson, setBundleJson] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const doSearch = async (q) => {
    if (!q || q.trim().length < 1) return;
    setLoading(true);
    try {
      const r = await searchTerms(q, 12);
      setResults(r);
    } catch (e) {
      console.error(e);
      alert("Search failed");
    }
    setLoading(false);
  };

  const onTranslate = async (item) => {
    setLoading(true);
    try {
      // ✅ Correct parameter structure
      const parameters = await translateValueCoding({
        system: item.system || "https://namaste.ayush.gov.in/codesystem/NAMASTE",
        code: item.code,
        display: item.display,
      });

      let icdDisplay = null;
      if (parameters && Array.isArray(parameters.parameter)) {
        const cand = parameters.parameter.find((p) => p.name === "candidate");
        if (cand && cand.valueString) {
          try {
            const parsed = JSON.parse(cand.valueString);
            icdDisplay =
              parsed.namaste && parsed.namaste.display
                ? parsed.namaste.display
                : null;
          } catch (e) {}
        }
      }

      setProblemList((prev) => [
        ...prev,
        { code: item.code, display: item.display, icdDisplay },
      ]);
    } catch (e) {
      console.error(e);
      alert("Translate failed");
    }
    setLoading(false);
  };

  const onRemove = (idx) =>
    setProblemList((pl) => pl.filter((_, i) => i !== idx));

  const onBuildBundle = async () => {
    if (!problemList.length) return alert("Problem list empty");
    const bundle = { resourceType: "Bundle", type: "transaction", entry: [] };
    problemList.forEach((p, i) => {
      const coding = [
        { system: "https://namaste.ayush.gov.in/codesystem/NAMASTE", code: p.code, display: p.display },
      ];
      if (p.icdDisplay)
        coding.push({
          system: "https://icd.who.int/tm2",
          code: p.code.replace("NAM_", "TM2_"),
          display: p.icdDisplay,
        });

      bundle.entry.push({
        resource: {
          resourceType: "Condition",
          id: "cond-" + (i + 1),
          subject: { reference: "Patient/p1" },
          code: { coding },
          onsetDateTime: new Date().toISOString().slice(0, 10),
        },
        request: { method: "POST", url: "Condition" },
      });
    });
    setBundleJson(bundle);
  };

  const onUploadBundle = async () => {
    if (!bundleJson) return alert("Build bundle first");
    try {
      const res = await uploadBundle(bundleJson);
      alert("Bundle uploaded. See console for response.");
      console.log("Upload response:", res);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    }
  };

  const handleHeroSearch = () => {
    if (searchQuery.trim()) {
      doSearch(searchQuery);
      setActiveTab("term-service");
    }
  };

  return (
    <div className="app">
      {/* NAMASTE Header */}
      <header className="namaste-header">
        <div className="header-top">
          Government of India भारत सरकार | Ministry of Ayush
        </div>
        <div className="header-main">
          <div className="header-content">
            <div className="logo-section">
              <div>
                <div className="gov-india-text">Government of India</div>
                <h1 className="namaste-title">NAMASTE PORTAL</h1>
                <div className="namaste-subtitle">
                  NATIONAL AYUSH MORBIDITY AND STANDARDIZED TERMINOLOGIES ELECTRONIC PORTAL
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-btn">Sign In</button>
              <button className="header-btn">Sign Up</button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-content">
          <ul className="nav-tabs">
            <li 
              className={`nav-tab ${activeTab === "home" ? "active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              Home
            </li>
            <li 
              className={`nav-tab ${activeTab === "morbidity-codes" ? "active" : ""}`}
              onClick={() => setActiveTab("morbidity-codes")}
            >
              Morbidity Codes
            </li>
            <li 
              className={`nav-tab ${activeTab === "standard-terms" ? "active" : ""}`}
              onClick={() => setActiveTab("standard-terms")}
            >
              Standard Terms
            </li>
            <li 
              className={`nav-tab ${activeTab === "term-service" ? "active" : ""}`}
              onClick={() => setActiveTab("term-service")}
            >
              Term Service
            </li>
            <li 
              className={`nav-tab ${activeTab === "dashboards" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboards")}
            >
              Dashboards
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      {activeTab === "home" && (
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Search Now</h2>
            <p className="hero-subtitle">Enter Keyword to search NAMASTE terminologies</p>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Enter Keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleHeroSearch()}
              />
              <button className="search-btn" onClick={handleHeroSearch}>
                Search
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Statistics Section */}
      {activeTab === "home" && (
        <section className="stats-section">
          <div className="stats-container">
            <h3 className="stats-title">Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">256</div>
                <div className="stat-label">Hospitals Registered</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">187</div>
                <div className="stat-label">Uploading Data</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2,321,705</div>
                <div className="stat-label">OPD Data (Others)</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">12,119,333</div>
                <div className="stat-label">OPD Data (Since 2017)</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">160,502</div>
                <div className="stat-label">IPD Data (Since 2017)</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Home Tab Content */}
        <div className={`content-tab ${activeTab === "home" ? "active" : ""}`}>
          <div className="card">
            <h3>About NAMASTE Portal</h3>
            <p>
              The NAMASTE Portal developed by Ministry of AYUSH, provides information about 
              Standardised terminologies and Morbidity Codes along with dedicated data entry 
              module for updating morbidity statistics in consolidated form as well as on real time basis. 
              The launch of this portal is a landmark event in the history of AYUSH with a promise 
              to bring in equity with mainstream health care system.
            </p>
          </div>
        </div>

        {/* Term Service Tab Content */}
        <div className={`content-tab ${activeTab === "term-service" ? "active" : ""}`}>
          <div className="card">
            <h3>NAMASTE → ICD-11 Term Service</h3>
            <SearchBox onSearch={doSearch} />
            <div style={{ marginTop: 12 }}>
              {loading ? (
                <div style={{ padding: 12 }}>Loading…</div>
              ) : (
                <ResultsList items={results} onTranslate={onTranslate} />
              )}
            </div>
          </div>

          <ProblemList items={problemList} onRemove={onRemove} />

          <div className="card">
            <h3>Bundle Builder</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={onBuildBundle}>
                Build FHIR Bundle
              </button>
              <button className="smallBtn" onClick={onUploadBundle}>
                Upload Bundle
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="bundleArea">
                {bundleJson
                  ? JSON.stringify(bundleJson, null, 2)
                  : "Bundle will appear here after building."}
              </div>
            </div>
          </div>
        </div>

        {/* Other Tab Content */}
        <div className={`content-tab ${activeTab === "morbidity-codes" ? "active" : ""}`}>
          <div className="card">
            <h3>Morbidity Codes</h3>
            <p>Access standardized morbidity codes for Ayurveda, Siddha, Unani, WHO-ICD-10, and WHO-ICD-11 systems.</p>
          </div>
        </div>

        <div className={`content-tab ${activeTab === "standard-terms" ? "active" : ""}`}>
          <div className="card">
            <h3>Standard Terms</h3>
            <p>Browse standardized terminologies for Ayurveda, Unani, and Siddha systems.</p>
          </div>
        </div>

        <div className={`content-tab ${activeTab === "dashboards" ? "active" : ""}`}>
          <div className="card">
            <h3>Dashboards</h3>
            <p>View comprehensive dashboards and analytics for NAMASTE data.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            Website content owned by Ministry of Ayush, Government of India. 
            Designed, developed and maintained by BISAG-N, Meity-GOI
          </p>
          <p style={{ marginTop: "10px", fontSize: "12px" }}>
            Connected to backend at <code>/</code>. For production integrate ABHA OAuth and secure endpoints.
          </p>
        </div>
      </footer>
    </div>
  );
}

