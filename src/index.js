export default {
  async fetch(request, env) {
    const url = "https://boosterpoint.pl";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!response.ok) {
        return new Response(`BoosterPoint HTTP error: ${response.status}`, {
          status: 500
        });
      }

      const html = await response.text();

      return new Response(
        `TEST-BOOSTERPOINT-123456\n\nPobrano stronę: ${html.length} znaków`,
        {
          headers: {
            "content-type": "text/plain; charset=UTF-8"
          }
        }
      );
    } catch (error) {
      return new Response(`❌ Błąd: ${error.message}`, {
        status: 500
      });
    }
  }
};
