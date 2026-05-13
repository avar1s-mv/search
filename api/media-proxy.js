export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://gelbooru.com/",
      },
    });

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .send(`Upstream error: ${upstream.status}`);
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("media-proxy failed:", error);
    return res.status(500).json({ error: "Proxy failed" });
  }
}
