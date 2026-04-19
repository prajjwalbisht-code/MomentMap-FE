
async function testFullBulkFlow() {
    // Note: Next.js dev server usually runs on 3000
    const API_URL = "http://localhost:3000/api/products";
    const products = [
        { name: "Full Flow Product 1", styleCode: "FLOW001", category: "Test", price: 10, imageUrl: "http://example.com/1", color: "red", material: "cotton", vibe: "cool", audience: "all", silhouette: "loose", occasion: ["casual"], season: ["summer"], description: "Test" },
        { name: "Full Flow Product 2", styleCode: "FLOW002", category: "Test", price: 20, imageUrl: "http://example.com/2", color: "blue", material: "cotton", vibe: "cool", audience: "all", silhouette: "loose", occasion: ["casual"], season: ["summer"], description: "Test" }
    ];
    console.log(`Testing full bulk flow through ${API_URL}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products),
        });
        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log(`Response Data:`, data);
    } catch (err) {
        console.error(`Full flow failed with error:`, err);
    }
}

testFullBulkFlow();
