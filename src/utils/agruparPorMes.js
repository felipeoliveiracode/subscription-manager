export function agruparPorMes(assinaturas) {
  return assinaturas.reduce((acc, item) => {
    try {
      const dataObj = item.data?.toDate?.();
      if (!dataObj || isNaN(dataObj.getTime())) return acc;

      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const ano = dataObj.getFullYear();
      const chave = `${mes}/${ano}`;

      if (!acc[chave]) {
        acc[chave] = [];
      }

      acc[chave].push(item);
    } catch (err) {
      console.error("Erro ao agrupar assinatura:", item, err);
    }

    return acc;
  }, {});
}
