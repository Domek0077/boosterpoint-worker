export default {
  async fetch(request, env) {
    const testKey = "test";

    const oldValue = await env.PRODUCTS_KV.get(testKey);

    const newValue = new Date().toISOString();

    await env.PRODUCTS_KV.put(testKey, newValue);

    return new Response(
      JSON.stringify(
        {
          kv_dziala: true,
          poprzednia_wartosc: oldValue,
          nowa_wartosc: newValue
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
