
async function testBulkFetch() {
    const BACKEND_URL = "http://127.0.0.1:3001";
    const products = [
        { name: "Bulk Product 1", style_code: "BULK001", category: "Test", price: 1000, imageUrl: "http://example.com/1" },
        { name: "Bulk Product 2", style_code: "BULK002", category: "Test", price: 2000, imageUrl: "http://example.com/2" }
    ];
    console.log(`Testing bulk fetch with ${products.length} products to ${BACKEND_URL}/api/products`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products),
        });
        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log(`Response Data:`, data);
    } catch (err) {
        console.error(`Fetch failed with error:`, err);
    }
}

testBulkFetch();
