const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNgWWoYv9Hp1I2RlsKXAu4MTaIwfglPw5_nhN6lP_9V2ciujUis33d57y6fclGUcSv/exec";

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    let target = APPS_SCRIPT_URL;

    if (method === "GET") {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query || {})) {
        if (Array.isArray(value)) value.forEach(v => qs.append(key, String(v)));
        else if (value !== undefined && value !== null) qs.append(key, String(value));
      }
      const query = qs.toString();
      if (query) target += "?" + query;
    }

    const init = {
      method,
      redirect: "follow",
      headers: { "Accept": "application/json" }
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      init.headers["Content-Type"] = "text/plain;charset=utf-8";
      init.body = body;
    }

    const upstream = await fetch(target, init);
    const text = await upstream.text();

    res.status(upstream.status || 200);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    return res.send(text);
  } catch (error) {
    res.status(502).json({ ok: false, error: "Backend proxy failed", detail: error?.message || String(error) });
  }
}
