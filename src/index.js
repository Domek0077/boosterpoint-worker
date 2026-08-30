export default {
  async fetch(request, env) {
    const response = await fetch("https://boosterpoint.pl", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();

    const positions = [];
    let pos = 0;

    while ((pos = html.toLowerCase().indexOf("product", pos)) !== -1) {
      positions.push(
        html.substring(Math.max(0, pos - 300), Math.min(html.length, pos + 700))
      );

      pos += 7;

      if (positions.length >= 5) break;
    }

    return new Response(
      JSON.stringify(
        {
          html_length: html.length,
          samples_found: positions.length,
          samples: positions
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
  }
};
