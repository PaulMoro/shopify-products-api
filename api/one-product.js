// api/products.js
export default async function handler(req, res) {
  // Permitir solo el dominio de Shopify (CORS seguro)
  res.setHeader("Access-Control-Allow-Origin", "https://emi-ve.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Manejar preflight de CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔑 Auth básica (Base64 de client_id:client_secret)
  const basicAuth = "Basic cFVOeXk4SWh5MkdHa2FyaE1hMXk0V1ExZHNjMkt6cW86cTNhbWNyenFBOVhGcTd4ZQ==";

  // 📦 Referencias dinámicas que llegan desde el query
  const { ref } = req.query;
  if (!ref) return res.status(400).json({ error: "Missing product reference(s)" });

  try {
    console.log("📡 Step 1: Getting OAuth2 token...");

    // 1️⃣ Obtener token
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

    const { access_token } = await tokenRes.json();
    console.log("✅ Step 2: Got access token");

    // 2️⃣ Construir URL dinámica
    const apiUrl = new URL("https://api.se.com/v2/reference-data/product/product-catalog/products");
    apiUrl.search = new URLSearchParams({
      supplierid: "Schneider_CO",
      "supplierid-type": "specific",
      customerid: "Emi Equipos_CO",
      "customerid-type": "specific",
      "product-reference": ref, // puede ser uno o varios separados por coma
      "etim-version": "ETIM-9.0",
    });

    console.log("📦 Fetching:", apiUrl.toString());

    // 3️⃣ Llamada GET real
    const productsRes = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        appID: "Emi Equipos CO",
        Authorization: `Bearer ${access_token}`,
      },
    });

    const raw = await productsRes.text();
    if (!productsRes.ok) {
      console.error("❌ Product fetch failed:", raw);
      return res.status(500).json({ error: "Failed to get products", details: raw });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    console.error("💥 Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}