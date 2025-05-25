import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  criarAssinatura,
  buscarAssinaturasPorUsuario,
  deletarAssinatura,
  marcarPagamentoMes
} from "../services/firestore";

import { agruparPorMes } from "../utils/agruparPorMes";

import InputField from "../components/InputField";

import { CheckCircle, Trash2 } from "lucide-react";

export default function Dashboard({ user }) {
  const auth = getAuth();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [parcelaAtual, setParcelaAtual] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [mesAtivo, setMesAtivo] = useState("");
  const agrupado = agruparPorMes(assinaturas);

  // Atualiza a aba ativa ao carregar os dados
  useEffect(() => {
    if (!carregando && assinaturas.length > 0 && !mesAtivo) {
      const primeiroMes = Object.keys(agrupado)[0];
      if (primeiroMes) setMesAtivo(primeiroMes);
    }
  }, [carregando, assinaturas]);



  const carregarAssinaturas = async (mesParaManter = null) => {
    setCarregando(true);
    const lista = await buscarAssinaturasPorUsuario(user.uid);
    setAssinaturas(lista);
    setCarregando(false);

    // Se foi passado um mês para manter, mantemos ele como ativo
    if (mesParaManter) {
      setMesAtivo(mesParaManter);
    }
  };

  useEffect(() => {
    carregarAssinaturas();
  }, []);

  const criarAssinaturasComParcelas = async ({
    uid,
    nome,
    valor, // Valor *de cada* parcela
    data, // Data do *primeiro* vencimento
    parcelaAtual, // Qual a primeira parcela (geralmente 1)
    quantidadeParcelas // Total de parcelas
  }) => {
    const dataVencimentoBase = new Date(data + "T00:00:00"); // Convertendo a string para um objeto Date

    for (let i = 0; i < quantidadeParcelas; i++) {
      const dataVencimento = new Date(dataVencimentoBase); // Criando uma nova data baseada na primeira
      dataVencimento.setMonth(dataVencimentoBase.getMonth() + i); // Adicionando 'i' meses para obter o vencimento de cada parcela

      await criarAssinatura({ // Chamando sua função existente para salvar *cada parcela*
        uid,
        nome,
        valor: parseFloat(valor) || 0, // Usando o valor informado como o valor de cada parcela
        data: dataVencimento, // A data de vencimento *desta parcela*
        paga: false,
        criadaEm: new Date(),
        parcelaAtual: i + 1, // Número da parcela atual (1, 2, 3...)
        quantidadeParcelas // Total de parcelas (para referência)
      });
    }
  };

  const handleNovaAssinatura = async (e) => {
    e.preventDefault();

    if (!nome || !valor || !data || !parcelaAtual || !quantidadeParcelas) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    await criarAssinaturasComParcelas({ // Agora chamamos a nova função
      uid: user.uid,
      nome,
      valor: parseFloat(valor) || 0, // Passando o valor informado para ser o valor de cada parcela
      data,
      parcelaAtual: Number(parcelaAtual) || 1,
      quantidadeParcelas: Number(quantidadeParcelas) || 1
    });

    setNome("");
    setValor("");
    setData("");
    setParcelaAtual("");
    setQuantidadeParcelas("");
    carregarAssinaturas();
  };

  const handleDeletar = async (id) => {
    await deletarAssinatura(id);
    carregarAssinaturas();
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  function ordenarMesesComMesAtualCentralizado(meses) {
    const mesesComData = meses.map((mes) => {
      const [nome, ano] = mes.split("/");
      const data = new Date(`${nome} 01, ${ano}`);
      return { mes, data };
    });

    // Ordena os meses em ordem crescente
    mesesComData.sort((a, b) => a.data - b.data);

    const hoje = new Date();
    const mesAtualIndex = mesesComData.findIndex(
      (m) =>
        m.data.getMonth() === hoje.getMonth() &&
        m.data.getFullYear() === hoje.getFullYear()
    );

    // Se o mês atual existir na lista
    if (mesAtualIndex !== -1) {
      const anteriores = mesesComData.slice(0, mesAtualIndex);
      const atual = mesesComData[mesAtualIndex];
      const seguintes = mesesComData.slice(mesAtualIndex + 1);
      return [...anteriores, atual, ...seguintes].map((item) => item.mes);
    }

    // Se o mês atual não estiver na lista, retorna tudo em ordem crescente
    return mesesComData.map((item) => item.mes);
  }

  const handleTogglePagoPorMes = async (id, anoMes, pago) => {
    await marcarPagamentoMes(id, anoMes, pago);
    carregarAssinaturas(mesAtivo); // preserva o mês ativo
  };

  return (

    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Assinaturas</h1>
        <button
          onClick={handleLogout}
          className="cursor-pointer text-red-500 hover:underline"
        >
          Sair
        </button>
      </div>

      <form onSubmit={handleNovaAssinatura} className="space-y-4 mb-8">

        <InputField
          id="nome"
          label="Nome da assinatura"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex: Netflix"
        />

        <InputField
          id="valor"
          label="Valor mensal (R$)"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          placeholder="Ex: 39.90"
        />

        <InputField
          id="data"
          label="Data de vencimento"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Parcela atual</label>
            <input
              type="number"
              min={1}
              value={parcelaAtual}
              onChange={(e) => setParcelaAtual(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: 1"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Total de parcelas</label>
            <input
              type="number"
              min={1}
              value={quantidadeParcelas}
              onChange={(e) => setQuantidadeParcelas(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: 12"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Adicionar Assinatura
        </button>
      </form>

      {
        carregando ? (
          <p>Carregando...</p>
        ) : assinaturas.length === 0 ? (
          <p className="text-gray-500">Nenhuma assinatura cadastrada.</p>
        ) : (
          <div>

            {/* ABAS */}
            <div className="p-1 flex gap-2 mb-4 overflow-x-auto scrollbar-hide transition-all duration-300">
              {ordenarMesesComMesAtualCentralizado(Object.keys(agrupado)).map((mes) => {
                const [mesNumero, ano] = mes.split("/");
                const data = new Date(`${ano}-${mesNumero}-01`);
                const nomeMes = data.toLocaleDateString("pt-BR", { month: "short" });
                const nomeFormatado = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${ano}`;

                return (
                  <button
                    key={mes}
                    onClick={() => setMesAtivo(mes)}
                    className={`cursor-pointer px-4 py-2 rounded-full text-sm ${mes === mesAtivo
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {nomeFormatado.charAt(0).toUpperCase() + nomeFormatado.slice(1)}
                  </button>
                );
              })}

            </div>

            {/* CONTEÚDO DA ABA ATIVA */}
            <ul className="space-y-2">
              {agrupado[mesAtivo]?.map((item) => {
                const [mesNumero, ano] = mesAtivo.split("/");
                const anoMes = `${ano}-${mesNumero.padStart(2, "0")}`;
                const estaPaga = item.pagos?.[anoMes] ?? false;

                const hoje = new Date();
                const dataVencimento = item.data.toDate(); // Agora 'item.data' é a data de vencimento da parcela

                let statusPagamento = "pendente";
                if (estaPaga) {
                  statusPagamento = "pago";
                } else if (dataVencimento < hoje) {
                  statusPagamento = "vencido";
                }

                const dataVencimentoFormatada = dataVencimento.toLocaleDateString("pt-BR");

                return (
                  <li
                    key={item.id}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded"
                  >
                    <div>
                      <p className="font-semibold">{item.nome}</p>
                      <p className="text-sm text-gray-600">
                        R$ {item.valor.toFixed(2)} - Parcela {item.parcelaAtual} de {item.quantidadeParcelas}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vence em {dataVencimentoFormatada}
                      </p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span
                        className={`mr-4 text-xs font-medium px-3 py-1 rounded-full 
                      ${statusPagamento === "pago"
                            ? "bg-green-500 text-white"
                            : statusPagamento === "pendente"
                              ? "bg-yellow-400 text-black"
                              : "bg-red-500 text-white"}
  `}
                      >
                        {statusPagamento === "pago"
                          ? "Pago"
                          : statusPagamento === "pendente"
                            ? "Pendente"
                            : "Vencido"}
                      </span>

                      <button
                        onClick={() => handleTogglePagoPorMes(item.id, anoMes, !estaPaga)}
                        className={`cursor-pointer p-2 rounded-full transition-colors 
                      ${estaPaga ? "bg-green-500 text-white" : "bg-green-400 text-black hover:bg-green-500"}`}
                        title={estaPaga ? "Pago" : "Marcar como pago"}
                      >
                        <CheckCircle size={18} />
                      </button>

                      <button
                        onClick={() => handleDeletar(item.id)}
                        className="cursor-pointer bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="text-center px-2 mt-6 font-medium text-gray-700">
              Total: {" "}
              {agrupado[mesAtivo]
                ?.reduce((total, item) => total + item.valor, 0)
                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>

          </div>
        )
      }

    </div >

  )
}