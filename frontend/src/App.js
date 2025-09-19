import React, { useState } from "react";
import SearchBox from "./components/SearchBox";
import ResultsList from "./components/ResultsList";
import ProblemList from "./components/ProblemList";
import { searchTerms, translateValueCoding, uploadBundle } from "./api";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [problemList, setProblemList] = useState([]);
  const [translateResult, setTranslateResult] = useState(null);
  const [bundleJson, setBundleJson] = useState(null);

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

      setTranslateResult(parameters); // store for display

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

  return (
    <div className="container">
      <div className="header">
        <h1>NAMASTE → ICD-11 (Prototype UI)</h1>
        <div className="badge">Prototype</div>
      </div>

      <div className="card">
        <h3>Search Diagnosis</h3>
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

      {/* ✅ Show translate result for debugging */}
      {translateResult && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Last Translate Result</h3>
          <pre>{JSON.stringify(translateResult, null, 2)}</pre>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
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

      <div className="footer">
        Connected to backend at <code>/</code>. For production integrate ABHA
        OAuth and secure endpoints.
      </div>
    </div>
  );
}

