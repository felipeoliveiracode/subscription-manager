export function agruparPorMes(assinaturas) {
  return assinaturas.reduce((acc, item) => {
    try {
      // 1. Converte o timestamp do Firebase para um objeto Date do JavaScript.
      //    item.data é esperado como um objeto Timestamp do Firebase.
      //    O método toDate() converte este Timestamp para um objeto Date JavaScript.
      const dataObj = item.data?.toDate?.();

      // 2. Verifica se a conversão foi bem-sucedida e se a data é válida.
      //    Se dataObj não existir ou for uma data inválida (isNaN(dataObj.getTime())),
      //    retorna o acumulador atual sem processar este item, prevenindo erros.
      if (!dataObj || isNaN(dataObj.getTime())) return acc;

      // 3. Extrai o mês e o ano da data usando métodos UTC.
      //    dataObj.getUTCMonth() retorna o mês em UTC (0 para Janeiro, 11 para Dezembro).
      //    Adicionamos 1 para ter o formato comum de mês (1-12).
      //    String(...) converte para string, e padStart(2, "0") garante dois dígitos (ex: "05" para Maio).
      const mes = String(dataObj.getUTCMonth() + 1).padStart(2, "0");

      //    dataObj.getUTCFullYear() retorna o ano com quatro dígitos em UTC.
      const ano = dataObj.getUTCFullYear();

      // 4. Cria a chave de agrupamento no formato "MM/AAAA".
      const chave = `${mes}/${ano}`;

      // 5. Agrupa os itens.
      //    Se a chave (ex: "05/2025") ainda não existe no acumulador (acc),
      //    cria um array vazio para ela.
      if (!acc[chave]) {
        acc[chave] = [];
      }

      //    Adiciona o item atual ao array correspondente à sua chave de mês/ano.
      acc[chave].push(item);
    } catch (err) {
      // 6. Em caso de erro durante o processamento de um item,
      //    registra o erro no console e o item que causou o problema.
      //    Isso ajuda na depuração sem interromper o processamento dos demais itens.
      console.error("Erro ao agrupar assinatura:", item, err);
    }

    // 7. Retorna o acumulador para a próxima iteração do reduce.
    return acc;
  }, {} /* Valor inicial do acumulador: um objeto vazio */);
}