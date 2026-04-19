
async function testLargeFetch() {
    const BACKEND_URL = "http://127.0.0.1:3001";
    // Create a body larger than 100kb
    const largeData = {
        name: "Test Product",
        style_code: "TEST123",
        description: "A".repeat(150000) // ~150kb
    };
    console.log(`Testing fetch with ~150kb payload to ${BACKEND_URL}/api/products`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(largeData),
        });
        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log(`Response Data:`, data);
    } catch (err) {
        console.error(`Fetch failed with error:`, err);
    }
}

testLargeFetch();
