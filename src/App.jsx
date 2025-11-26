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
