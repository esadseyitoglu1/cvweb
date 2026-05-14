const apiKey = "AIzaSyCtf6d0ifVWvuxgmNvurZ6OWYrQvutR8NM";

async function listMyModels() {
  console.log("Google'a 'Bana hangi modelleri veriyorsun?' diye soruluyor...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("HATA:", data.error.message);
      return;
    }

    // Sadece generateContent (metin üretimi) destekleyenleri filtreleyelim
    const validModels = data.models
      .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", "")); // "models/gemini-1.5-flash" -> "gemini-1.5-flash"
      
    console.log("\n✅ İŞTE SENİN ANAHTARINLA ÇALIŞAN MODELLER:");
    validModels.forEach(m => console.log(`- ${m}`));
    
  } catch (error) {
    console.error("İstek başarısız:", error);
  }
}

listMyModels();
