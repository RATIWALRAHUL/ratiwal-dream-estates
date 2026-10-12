async function fetchPage(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    if (!res.ok) {
      console.log(url, `status: ${res.status}`);
      return;
    }
    const html = await res.text();
    const imgs = [...html.matchAll(/https?:\/\/[^\s\"\'\<\>]+\.(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]);
    console.log(url, "=> found images:", [...new Set(imgs)].slice(0, 10));
  } catch (e: any) {
    console.error(url, "error:", e.message);
  }
}

async function run() {
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Aero-Crystal");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/One-Kishangarh");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Balaji-Puram");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Happy-Business-Park");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Vrindavan-Vihar");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Vrindavan-Vihaar");
  await fetchPage("https://www.happyrealearth.com/projectsdetails/Vrindavan");
}

run();
