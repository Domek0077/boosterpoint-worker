export default {
  async fetch(request, env) {
    const url = "https://boosterpoint.pl/wszystkie-produkty/";
    const KV_KEY = "boosterpoint_products";
    const CHAT_ID = "5958605903";

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

      const productRegex =
        /<li[^>]*class="[^"]*\bproduct\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

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
          .replace(/&#122;/gi, "z")
          .replace(/&#322;/gi, "ł")
          .replace(/\s+/g, " ")
          .trim();

      let match;

      while ((match = productRegex.exec(html)) !== null) {
        const block = match[1];

        const nameMatch = block.match(
          /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i
        );

        const linkMatch = block.match(
          /<a[^>]*href=["']([^"']+)["'][^>]*>/i
        );

        const priceMatch = block.match(
          /<span[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );

        if (!nameMatch || !linkMatch) continue;

        const name = clean(nameMatch[1]);

        const price = priceMatch
          ? clean(priceMatch[1])
          : "brak ceny";

        let productUrl = linkMatch[1];

        if (productUrl.startsWith("/")) {
          productUrl = "https://boosterpoint.pl" + productUrl;
        }

        if (!products.some((p) => p.url === productUrl)) {
          products.push({
            name,
            price,
            url: productUrl
          });
        }
      }

      const oldData = await env.PRODUCTS_KV.get(KV_KEY);
      const oldProducts = oldData ? JSON.parse(oldData) : [];

      const oldUrls = new Set(
        oldProducts.map((product) => product.url)
      );

      const newProducts = products.filter(
        (product) => !oldUrls.has(product.url)
      );

      // Zapisujemy aktualny stan
      await env.PRODUCTS_KV.put(
        KV_KEY,
        JSON.stringify(products)
      );

      // Telegram
      let telegramSent = 0;

      if (newProducts.length > 0 && env.TELEGRAM_BOT_TOKEN) {
        for (const product of newProducts) {
          const message =
            `🆕 <b>NOWY PRODUKT — BoosterPoint</b>\n\n` +
            `🃏 ${product.name}\n` +
            `💰 ${product.price}\n\n` +
            `🔗 <a href="${product.url}">Otwórz produkt</a>`;

          const telegramResponse = await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: false
              })
            }
          );

          if (telegramResponse.ok) {
            telegramSent++;
          }
        }
      }

      return new Response(
        JSON.stringify(
          {
            shop: "BoosterPoint",
            checked_at: new Date().toISOString(),
            products_found: products.length,
            previous_products: oldProducts.length,
            new_products: newProducts.length,
            telegram_sent: telegramSent,
            new_products_list: newProducts
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
