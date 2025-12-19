import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const secret = req.headers.get("x-book-secret");
    if (!process.env.BOOK_API_SECRET || secret !== process.env.BOOK_API_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, size = "1024x1024", quality = "low" } = await req.json();
    if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      quality,
      n: 1,
    });

    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: "No image returned" }, { status: 500 });

    return Response.json({ b64, format: "png" });
  } catch (e) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
