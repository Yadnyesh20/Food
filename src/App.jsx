import { useState } from "react";
import "./index.css";

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredientsText, setIngredientsText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const classifyProcessing = (text) => {
    const lower = text.toLowerCase();

    const highlyProcessedKeywords = [
      "emulsifier",
      "stabilizer",
      "artificial",
      "flavour",
      "flavor",
      "colour",
      "color",
      "preservative",
      "corn syrup",
      "glucose syrup",
      "high fructose",
      "equivalent to",
      "e202",
      "e211",
      "e621",
      "e627",
      "e631",
    ];

    const moderatelyProcessedKeywords = [
      "refined flour",
      "maida",
      "corn starch",
      "palm oil",
      "hydrogenated",
      "maltodextrin",
      "invert sugar",
      "lecithin",
    ];

    let score = 0;

    highlyProcessedKeywords.forEach((k) => {
      if (lower.includes(k)) score += 2;
    });

    moderatelyProcessedKeywords.forEach((k) => {
      if (lower.includes(k)) score += 1;
    });

    let processingLevel = "Less processed";
    let frequency = "Safe for everyday consumption (in reasonable portions).";

    if (score >= 4) {
      processingLevel = "Highly processed";
      frequency = "Occasional treat only – about once a week or less.";
    } else if (score >= 2) {
      processingLevel = "Moderately processed";
      frequency = "Limit to a few times per week.";
    }

    return { processingLevel, frequency };
  };

  const suggestAlternatives = (text) => {
    const lower = text.toLowerCase();
    const alternatives = new Set();

    if (lower.includes("cereal") || lower.includes("flakes")) {
      alternatives.add("Plain oats with fresh fruit");
      alternatives.add("Homemade muesli with nuts and seeds");
    }

    if (lower.includes("biscuit") || lower.includes("cookie")) {
      alternatives.add("Whole grain crackers without added sugar");
      alternatives.add("Homemade biscuits using whole wheat flour and jaggery");
    }

    if (lower.includes("chips") || lower.includes("namkeen") || lower.includes("snack")) {
      alternatives.add("Roasted chana or makhana");
      alternatives.add("Homemade popcorn with minimal oil and salt");
    }

    if (lower.includes("drink") || lower.includes("juice") || lower.includes("beverage")) {
      alternatives.add("Plain water infused with lemon or mint");
      alternatives.add("Freshly made fruit juice without added sugar");
    }

    // Default suggestions if nothing matches
    if (alternatives.size === 0) {
      alternatives.add("Fresh fruits and seasonal salads");
      alternatives.add("Homemade snacks with minimal ingredients");
      alternatives.add("Products with short, simple ingredient lists");
    }

    return Array.from(alternatives);
  };

  const handleAnalyze = () => {
    if (!ingredientsText.trim()) {
      alert("Please paste the ingredients list text.");
      return;
    }

    setLoading(true);

    // Simulate "AI thinking" delay for demo
    setTimeout(() => {
      const { processingLevel, frequency } = classifyProcessing(ingredientsText);
      const alternatives = suggestAlternatives(ingredientsText);

      setResult({
        processingLevel,
        frequency,
        alternatives,
      });
      setLoading(false);
    }, 800);
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
              This is just for visual demo on the frontend. Actual text analysis is based on the text you paste below.
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
              *This is a prototype using simple rule-based logic on the frontend. In a full product, this
              would be powered by a trained AI model and proper nutritional databases.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
