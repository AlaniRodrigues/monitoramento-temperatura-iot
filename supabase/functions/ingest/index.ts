import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const chave = Deno.env.get("INGEST_KEY");
  const recebida = req.headers.get("x-ingest-key");

  if (!chave || !recebida || recebida !== chave) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const dados = await req.json();

    const leitura =
      dados.reading && typeof dados.reading === "object"
        ? dados.reading
        : dados;

    const temperatura = Number(leitura.temperatura);
    const umidade = Number(leitura.umidade);
    const device_id = String(
      leitura.device_id ?? dados.device_id ?? "esp32"
    );

    if (
      !Number.isFinite(temperatura) ||
      !Number.isFinite(umidade) ||
      !device_id.trim()
    ) {
      return json({ error: "invalid_contract" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("leituras")
      .insert({ temperatura, umidade, device_id });

    if (error) {
      console.error(error.message);
      return json({ error: "database_error" }, 500);
    }

    return json({ ok: true, inserted: true });
  } catch (error) {
    console.error(error);
    return json({ error: "invalid_request" }, 400);
  }
});
