export default {
  async fetch(request, env) {
    return new Response(
      "🔥 Pokémon TCG Monitor działa!",
      {
        headers: {
          "content-type": "text/plain; charset=UTF-8"
        }
      }
    );
  }
};
