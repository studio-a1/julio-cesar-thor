"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/create-coinbase-charge.ts
var create_coinbase_charge_exports = {};
__export(create_coinbase_charge_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(create_coinbase_charge_exports);
var COINBASE_COMMERCE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY;
var COINBASE_API_URL = "https://api.commerce.coinbase.com/charges";
var handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { trackName, trackId, price } = JSON.parse(event.body || "{}");
    if (!trackName || !trackId || !price) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required parameters." }) };
    }
    const appUrl = process.env.URL?.replace(/\/$/, "");
    const chargeData = {
      name: trackName,
      description: `Purchase of the track: ${trackName}`,
      local_price: {
        amount: price,
        currency: "USD"
      },
      pricing_type: "fixed_price",
      metadata: {
        trackId,
        trackName
      },
      redirect_url: `${appUrl}/success`
      // cancel_url: `${appUrl}/`, // Optional
    };
    const response = await fetch(COINBASE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": COINBASE_COMMERCE_API_KEY,
        "X-CC-Version": "2018-03-22"
      },
      body: JSON.stringify(chargeData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Coinbase API Error:", errorData);
      throw new Error("Failed to create Coinbase Commerce charge.");
    }
    const responseData = await response.json();
    const charge = responseData.data;
    return {
      statusCode: 200,
      body: JSON.stringify({ hosted_url: charge.hosted_url, code: charge.code })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error." })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=create-coinbase-charge.js.map
