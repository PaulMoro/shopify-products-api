// api/products.js

export default async function handler(req, res) {
  // 1️⃣ Tu autenticación Base64 (client_id:client_secret)
  const basicAuth = "Basic cFVOeXk4SWh5MkdHa2FyaE1hMXk0V1ExZHNjMkt6cW86cTNhbWNyenFBOVhGcTd4ZQ=="; // 👈 reemplaza con el valor generado

  // 2️⃣ URLs
  const tokenUrl = "https://api.se.com/token";
  const productsUrl =
    "https://api.se.com/v2/reference-data/product/product-catalog/products" +
    "?supplierid=Schneider_CO&supplierid-type=specific" +
    "&customerid=Emi%20Equipos_CO&customerid-type=specific" +
    "&product-reference=NSYCCASTE" +
    "&english-descriptions=false" +
    "&data-filtering=all";

  try {
    console.log("🚀 Step 1: Requesting OAuth2 token...");

    // 3️⃣ Obtener el token igual que en Postman
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenText = await tokenRes.text();
    console.log("🧾 Raw token response:", tokenText);

    if (!tokenRes.ok) {
      return res.status(401).json({
        error: "Failed to obtain token",
        details: tokenText,
      });
    }

    const tokenData = JSON.parse(tokenText);
    const accessToken = tokenData.access_token;

    console.log("✅ Step 2: Got token:", accessToken);

    // 4️⃣ Llamar al endpoint de productos con ese token
    console.log("📦 Step 3: Fetching products...");

    const productRes = await fetch(productsUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        appID: "Emi Equipos CO",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const productText = await productRes.text();
    console.log("🧾 Raw products response:", productText);

    if (!productRes.ok) {
      return res.status(productRes.status).json({
        error: "Failed to get products",
        details: productText,
      });
    }

    const data = JSON.parse(productText);
    return res.status(200).json(data);
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return res.status(500).json({ error: err.message });
  }
}
