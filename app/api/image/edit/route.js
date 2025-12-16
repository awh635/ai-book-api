import OpenAI from "openai";

export const runtime = "nodejs";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null; // don't throw at import/build time
  return new OpenAI({ apiKey });
}


function b64ToPngFile(b64) {
  const bytes = Buffer.from(b64, "base64");
  return new File([bytes], "prev.png", { type: "image/png" });
}

export async function POST(req) {
  try {
    const secret = req.headers.get("x-book-secret");
    if (!secret || secret !== process.env.BOOK_API_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      prompt,
      previousImageB64,
      size = "1024x1024",
      quality = "low",
      input_fidelity = "high",
      n = 1,
    } = await req.json();

    if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });
    if (!previousImageB64) return Response.json({ error: "Missing previousImageB64" }, { status: 400 });

    const imageFile = b64ToPngFile(previousImageB64);

    // ✅ NOTE: edit (singular), not edits
    const result = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      size,
      quality,
      input_fidelity,
      n,
    });

    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: "No edited image returned" }, { status: 500 });

    return Response.json({ b64, format: "png" });
  } catch (err) {
    return Response.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
