// src/App.jsx
import { useState, useMemo } from "react";
import "./index.css";

export default function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredientsText, setIngredientsText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!ingredientsText.trim()) {
      alert("Please paste the ingredients list text.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/.netlify/functions/analyzeFood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredientsText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze food.");
    } finally {
      setLoading(false);
    }
  };

  const processingBadgeClass = useMemo(() => {
    if (!result) return "badge badge-neutral";
    if (result.processingLevel.toLowerCase().includes("high")) return "badge badge-high";
    if (result.processingLevel.toLowerCase().includes("moderate")) return "badge badge-medium";
    return "badge badge-low";
  }, [result]);

  return (
    <div className="page">
      <div className="gradient-bg" />
      <header className="app-header">
        <div className="logo-chip">NutriScan AI</div>
        <div>
          <h1>Food Processing Checker</h1>
          <p className="subtitle">
            Scan your packaged food’s ingredients and get an instant, easy-to-read processing score with healthier
            suggestions.
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className="card layout">
          <div className="left-panel">
            <p className="step-label">Step 1</p>
            <h2>Upload ingredients image <span className="optional-tag">optional</span></h2>
            <p className="hint">
              Add a clear photo of the ingredients list. This makes your demo look realistic, even though the current
              prototype reads the text you paste on the right.
            </p>

            <label className="file-upload">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span>📷 Choose ingredients image</span>
            </label>

            {imagePreview && (
              <div className="image-preview">
                <p className="preview-label">Preview</p>
                <div className="image-frame">
                  <img src={imagePreview} alt="Ingredients preview" />
                </div>
              </div>
            )}

            <div className="info-pill">
              ℹ️ In the full product, this image would be processed with OCR and an AI model trained on food labels.
            </div>
          </div>

          <div className="right-panel">
            <p className="step-label">Step 2</p>
            <h2>Paste ingredients text</h2>
            <p className="hint">
              Copy the ingredients list from any packaged food and paste it below. The backend will classify how
              processed it is and how often it should be eaten.
            </p>

            <textarea
              className="ingredients-input"
              placeholder="Example: Wheat flour, sugar, palm oil, maltodextrin, glucose syrup, emulsifier (E322), artificial flavour, preservative (E211)..."
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={9}
            />

            <div className="button-row">
              <button className="analyze-button" onClick={handleAnalyze} disabled={loading}>
                {loading ? "Analyzing..." : "Check processing level"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setIngredientsText(
                    "Wheat flour, sugar, palm oil, maltodextrin, glucose syrup, emulsifier (E322), stabilizer (E415), artificial flavour, preservative (E211)"
                  );
                }}
              >
                Use sample data
              </button>
            </div>

            {errorMsg && <p className="error-text">⚠ {errorMsg}</p>}
          </div>
        </section>

        {result && (
          <section className="card result-card">
            <div className="result-header">
              <div>
                <h2>Analysis result</h2>
                <p className="hint">
                  This score is generated by rule-based logic in a Netlify serverless function for prototype purposes.
                </p>
              </div>
              <span className={processingBadgeClass}>{result.processingLevel}</span>
            </div>

            <div className="result-grid">
              <div className="result-block">
                <h3>Recommended frequency</h3>
                <p className="result-text">{result.frequency}</p>
              </div>
              <div className="result-block">
                <h3>Healthier alternatives</h3>
                <ul className="alt-list">
                  {result.alternatives.map((alt, index) => (
                    <li key={index}>• {alt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tag-row">
              <span className="tag">Prototype</span>
              <span className="tag">Netlify Functions</span>
              <span className="tag">Rule-based AI</span>
            </div>

            <p className="disclaimer">
              *In a production version, this logic can be replaced with a trained AI model, NOVA food classification,
              and verified nutritional databases.
            </p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Built as an Entrepreneurship & Innovation project</span>
        <span className="dot" />
        <span>Deployed on Netlify</span>
      </footer>
    </div>
  );
}
