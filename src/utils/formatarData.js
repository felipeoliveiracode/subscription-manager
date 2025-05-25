export function formatarData(dataFirebase, opcoes = {}) {
  try {
    const data = dataFirebase?.toDate?.();
    if (!data || isNaN(data.getTime())) return "Data inválida";

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...opcoes,
    });
  } catch (err) {
    console.error("Erro ao formatar data:", err);
    return "Data inválida";
  }
}
