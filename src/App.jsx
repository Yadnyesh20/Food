// src/App.jsx
import { useState } from "react";
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

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Food Processing Checker</h1>
        <p className="subtitle">
          Upload the ingredients list and find out how processed your food is – plus how often you should eat it.
        </p>
      </header>

      <main className="app-main">
        <section className="card layout">
          <div className="left-panel">
            <h2>1. Upload ingredients image (optional)</h2>
            <p className="hint">
              This is just for visual demo. The actual analysis is based on the text you paste on the right.
            </p>
            <label className="file-upload">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span>Choose ingredients image</span>
            </label>

            {imagePreview && (
              <div className="image-preview">
                <p className="preview-label">Preview:</p>
                <img src={imagePreview} alt="Ingredients preview" />
              </div>
            )}
          </div>

          <div className="right-panel">
            <h2>2. Paste ingredients text</h2>
            <textarea
              className="ingredients-input"
              placeholder="Example: Wheat flour, sugar, palm oil, emulsifier (E322), raising agents (E500), artificial flavour..."
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={10}
            />

            <button className="analyze-button" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze food processing"}
            </button>

            {errorMsg && <p className="error-text">{errorMsg}</p>}
          </div>
        </section>

        {result && (
          <section className="card result-card">
            <h2>Analysis Result</h2>
            <div className="result-grid">
              <div>
                <h3>Processing Level</h3>
                <p className="badge">{result.processingLevel}</p>
              </div>
              <div>
                <h3>Recommended Frequency</h3>
                <p>{result.frequency}</p>
              </div>
            </div>

            <div className="alternatives">
              <h3>Suggested Healthier Alternatives</h3>
              <ul>
                {result.alternatives.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </div>

            <p className="disclaimer">
              *This is a prototype using simple rule-based logic on a backend function. In a full product, this
              would be powered by a trained AI model and proper nutritional databases.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
