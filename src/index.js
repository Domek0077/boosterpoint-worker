export default {
  async fetch(request, env) {
    const url = "https://boosterpoint.pl";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        return new Response(
          `BoosterPoint HTTP error: ${response.status}`,
          { status: 500 }
        );
      }

      const html = await response.text();

      // Wyciąganie produktów z HTML
      const products = [];

      // PrestaShop - produkty na stronie
      const productRegex =
        /<article[^>]*class="[^"]*product-miniature[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;

      let match;

      while ((match = productRegex.exec(html)) !== null) {
        const block = match[1];

        // Nazwa produktu
        const nameMatch = block.match(
          /<h2[^>]*class="[^"]*product-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i
        );

        // Link
        const linkMatch = block.match(
          /<h2[^>]*class="[^"]*product-title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"/i
        );

        // Cena
        const priceMatch = block.match(
          /<span[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );

        if (!nameMatch) continue;

        const clean = (text) =>
          text
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&#39;/gi, "'")
            .replace(/&quot;/gi, '"')
            .replace(/\s+/g, " ")
            .trim();

        const name = clean(nameMatch[1]);
        const price = priceMatch ? clean(priceMatch[1]) : "brak ceny";

        let link = linkMatch ? linkMatch[1] : "";

        if (link.startsWith("/")) {
          link = "https://boosterpoint.pl" + link;
        }

        products.push({
          name,
          price,
          url: link
        });
      }

      return new Response(
        JSON.stringify(
          {
            shop: "BoosterPoint",
            products_found: products.length,
            products
          },
          null,
          2
        ),
        {
          headers: {
            "content-type": "application/json; charset=UTF-8"
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json; charset=UTF-8"
          }
        }
      );
    }
  }
};
