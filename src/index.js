export default {
  async fetch(request, env) {
    const url = "https://boosterpoint.pl";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        return new Response(
          `BoosterPoint HTTP error: ${response.status}`,
          { status: 500 }
        );
      }

      const html = await response.text();

      return new Response(
        `🔥 BoosterPoint działa!\n\nPobrano stronę: ${html.length} znaków`,
        {
          headers: {
            "content-type": "text/plain; charset=UTF-8"
          }
        }
      );

    } catch (error) {
      return new Response(
        `❌ Błąd: ${error.message}`,
        { status: 500 }
      );
    }
  }
};
