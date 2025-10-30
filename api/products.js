// api/products.js

export default async function handler(req, res) {
  // 1️⃣ Tu autenticación Base64 (client_id:client_secret)
  const basicAuth = "Basic cFVOeXk4SWh5MkdHa2FyaE1hMXk0V1ExZHNjMkt6cW86cTNhbWNyenFBOVhGcTd4ZQ=="; // 👈 reemplaza con el valor generado

  try {
    console.log("📡 Step 1: Getting OAuth2 token...");

    // 1️⃣ Pedir token a Schneider
    const tokenRes = await fetch("https://api.se.com/token", {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("❌ Token request failed:", errorText);
      return res.status(500).json({ error: "Failed to get token", details: errorText });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    console.log("✅ Step 2: Got token:", accessToken);

    // 2️⃣ Hacer GET del producto (igual que en Postman)
    const apiUrl =
      "https://api.se.com/v2/reference-data/product/product-catalog/products" +
      "?supplierid=Schneider_CO" +
      "&supplierid-type=specific" +
      "&customerid=Emi%20Equipos_CO" +
      "&customerid-type=specific" +
      "&date-of-reference=2021-12-01" +
      "&change-type=all" +
      "&product-reference=NSYCCASTE" +
      "&english-descriptions=false" +
      "&data-filtering=all";

    const productsRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        appID: "Emi Equipos CO",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const text = await productsRes.text();
    console.log("🧾 Raw products response:", text);

    if (!productsRes.ok) {
      return res.status(500).json({ error: "Failed to get products", details: text });
    }

    const productsData = JSON.parse(text);
    return res.status(200).json(productsData);
  } catch (err) {
    console.error("💥 Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
