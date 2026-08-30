```javascript
export default {
  async fetch(request, env) {
    const url = "https://boosterpoint.pl/wszystkie-produkty/";

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

      const products = [];

      // WooCommerce - pojedyncze produkty
      const productRegex =
        /<li[^>]*class="[^"]*\bproduct\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

      let match;

      const clean = (text) =>
        text
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&#39;/gi, "'")
          .replace(/&quot;/gi, '"')
          .replace(/&#8211;/gi, "–")
          .replace(/&#8212;/gi, "—")
          .replace(/&#038;/gi, "&")
          .replace(/\s+/g, " ")
          .trim();

      while ((match = productRegex.exec(html)) !== null) {
        const block = match[1];

        // Nazwa produktu
        const nameMatch = block.match(
          /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i
        );

        // Link produktu
        const linkMatch = block.match(
          /<a[^>]*href=["']([^"']+)["'][^>]*>/i
        );

        // Cena
        const priceMatch = block.match(
          /<span[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );

        if (!nameMatch) continue;

        const name = clean(nameMatch[1]);

        let price = priceMatch
          ? clean(priceMatch[1])
          : "brak ceny";

        let productUrl = linkMatch
          ? linkMatch[1]
          : "";

        if (productUrl.startsWith("/")) {
          productUrl = "https://boosterpoint.pl" + productUrl;
        }

        if (
          productUrl &&
          !products.some((p) => p.url === productUrl)
        ) {
          products.push({
            name,
            price,
            url: productUrl
          });
        }
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
        JSON.stringify(
          {
            error: error.message
          },
          null,
          2
        ),
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
```
