// netlify/functions/analyzeFood.js

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    const ingredientsTextRaw = body.ingredientsText || "";
    const ingredientsText = ingredientsTextRaw.toLowerCase().trim();

    if (!ingredientsText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ingredientsText is required" }),
      };
    }

    // --- Processing classification logic ---

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
      if (ingredientsText.includes(k)) score += 2;
    });

    moderatelyProcessedKeywords.forEach((k) => {
      if (ingredientsText.includes(k)) score += 1;
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

    // --- Alternative suggestions ---

    const alternatives = new Set();

    if (ingredientsText.includes("cereal") || ingredientsText.includes("flakes")) {
      alternatives.add("Plain oats with fresh fruit");
      alternatives.add("Homemade muesli with nuts and seeds");
    }

    if (ingredientsText.includes("biscuit") || ingredientsText.includes("cookie")) {
      alternatives.add("Whole grain crackers without added sugar");
      alternatives.add("Homemade biscuits using whole wheat flour and jaggery");
    }

    if (
      ingredientsText.includes("chips") ||
      ingredientsText.includes("namkeen") ||
      ingredientsText.includes("snack")
    ) {
      alternatives.add("Roasted chana or makhana");
      alternatives.add("Homemade popcorn with minimal oil and salt");
    }

    if (
      ingredientsText.includes("drink") ||
      ingredientsText.includes("juice") ||
      ingredientsText.includes("beverage")
    ) {
      alternatives.add("Plain water infused with lemon or mint");
      alternatives.add("Freshly made fruit juice without added sugar");
    }

    if (alternatives.size === 0) {
      alternatives.add("Fresh fruits and seasonal salads");
      alternatives.add("Homemade snacks with minimal ingredients");
      alternatives.add("Products with short, simple ingredient lists");
    }

    const response = {
      processingLevel,
      frequency,
      alternatives: Array.from(alternatives),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in analyzeFood function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
