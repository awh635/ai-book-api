import fs from "fs";

const secret = "ABACADAEAFAGAHAIAJAKALAMANAOAPAQARASATAUAVAWAXAYAZ";
const gen = JSON.parse(fs.readFileSync("gen.json", "utf8"));
const prevB64 = gen.b64;

const res = await fetch("http://localhost:3000/api/image/edit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-book-secret": secret,
  },
  body: JSON.stringify({
    previousImageB64: prevB64,
    prompt: "Same characters and style. Now they are rolling cookie dough with a rolling pin on the same kitchen table. No text.",
    size: "1024x1024",
    quality: "low",
    input_fidelity: "high",
  }),
});

const data = await res.json();
console.log("status", res.status);
console.log(data?.format, data?.b64 ? "(b64 returned)" : data);
