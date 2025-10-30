// api/products.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // 1️⃣ Obtener token Schneider (puedes automatizar esto luego)
    const tokenResponse = await fetch("https://api.se.com/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic N3hFQTd2NGdFTVpybDVmNkFwRjg0NXJEY1lBc0V4NDRkMVk3TndUazFVM1JEVU9xOkZJN0RaUnFyR0FCTjhrNDIzV1ZRR3hTZ2s0bWEyU0Zabll4QlJVWWRjcDZUbW9sV1ZYeHgzNnhqYmxxRkFvNmY=",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("❌ Token error:", err);
      return res.status(500).json({ error: "Failed to get token", details: err });
    }

    const { access_token } = await tokenResponse.json();

    // 2️⃣ Llamar la API de productos Schneider
    const url =
      "https://api.se.com/v2/reference-data/product/product-catalog/products" +
      "?supplierid=Schneider_CO&supplierid-type=specific" +
      "&customerid=Emi%20Equipos_CO&customerid-type=specific" +
      "&product-reference=NSYCCASTE" +
      "&english-descriptions=false" +
      "&data-filtering=all";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        appID: "Emi Equipos CO",
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("🔥 Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
