import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  criarAssinatura,
  buscarAssinaturasPorUsuario,
  deletarAssinatura,
  marcarPagamentoMes
} from "../services/firestore";

import { agruparPorMes } from "../utils/agruparPorMes";

import { CheckCircle, Trash2, Plus, LogOut, Calendar, CreditCard, Wallet } from "lucide-react";

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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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
    valor,
    data,
    parcelaAtual,
    quantidadeParcelas
  }) => {
    const dataVencimentoBase = new Date(data + "T00:00:00");

    for (let i = 0; i < quantidadeParcelas; i++) {
      const dataVencimento = new Date(dataVencimentoBase);
      dataVencimento.setMonth(dataVencimentoBase.getMonth() + i);

      await criarAssinatura({
        uid,
        nome,
        valor: parseFloat(valor) || 0,
        data: dataVencimento,
        paga: false,
        criadaEm: new Date(),
        parcelaAtual: i + 1,
        quantidadeParcelas
      });
    }
  };

  const handleNovaAssinatura = async (e) => {
    e.preventDefault();

    if (!nome || !valor || !data || !parcelaAtual || !quantidadeParcelas) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    await criarAssinaturasComParcelas({
      uid: user.uid,
      nome,
      valor: parseFloat(valor) || 0,
      data, // Passando a string da data
      parcelaAtual: Number(parcelaAtual) || 1,
      quantidadeParcelas: Number(quantidadeParcelas) || 1
    });

    setNome("");
    setValor("");
    setData("");
    setParcelaAtual("");
    setQuantidadeParcelas("");
    setMostrarFormulario(false);
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

    mesesComData.sort((a, b) => a.data - b.data);

    const hoje = new Date();
    const mesAtualIndex = mesesComData.findIndex(
      (m) =>
        m.data.getMonth() === hoje.getMonth() &&
        m.data.getFullYear() === hoje.getFullYear()
    );

    if (mesAtualIndex !== -1) {
      const anteriores = mesesComData.slice(0, mesAtualIndex);
      const atual = mesesComData[mesAtualIndex];
      const seguintes = mesesComData.slice(mesAtualIndex + 1);
      return [...anteriores, atual, ...seguintes].map((item) => item.mes);
    }

    return mesesComData.map((item) => item.mes);
  }

  const handleTogglePagoPorMes = async (id, anoMes, pago) => {
    await marcarPagamentoMes(id, anoMes, pago);
    carregarAssinaturas(mesAtivo);
  };

  const totalMesAtivo = agrupado[mesAtivo]?.reduce((total, item) => total + item.valor, 0) || 0;
  const totalPagoMesAtivo = agrupado[mesAtivo]?.reduce((total, item) => {
    const [mesNumero, ano] = mesAtivo.split("/");
    const anoMes = `${ano}-${mesNumero.padStart(2, "0")}`;
    const estaPaga = item.pagos?.[anoMes] ?? false;
    return total + (estaPaga ? item.valor : 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Minhas Assinaturas</h1>
                <p className="text-purple-200 text-sm">Gerencie suas contas mensais</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {!carregando && assinaturas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Total do Mês</p>
                  <p className="text-2xl font-bold text-white">
                    {totalMesAtivo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-green-200 text-sm">Já Pago</p>
                  <p className="text-2xl font-bold text-white">
                    {totalPagoMesAtivo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Restante</p>
                  <p className="text-2xl font-bold text-white">
                    {(totalMesAtivo - totalPagoMesAtivo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        <div className="mb-8">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus size={20} />
            Nova Assinatura
          </button>
        </div>

        {/* Form */}
        {mostrarFormulario && (
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Adicionar Nova Assinatura</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome da assinatura
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Ex: Netflix"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Ex: 39.90"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de vencimento
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Parcela atual
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={parcelaAtual}
                      onChange={(e) => setParcelaAtual(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total de parcelas
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantidadeParcelas}
                      onChange={(e) => setQuantidadeParcelas(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="12"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleNovaAssinatura}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  Adicionar Assinatura
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : assinaturas.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-lg">Nenhuma assinatura cadastrada</p>
            <p className="text-gray-500 text-sm">Adicione sua primeira assinatura para começar</p>
          </div>
        ) : (
          <div>
            {/* Month Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {ordenarMesesComMesAtualCentralizado(Object.keys(agrupado)).map((mes) => {
                const [mesNumero, ano] = mes.split("/");
                const data = new Date(`${mesNumero}`);
                const nomeMes = data.toLocaleDateString("pt-BR", { month: "short" });
                const nomeFormatado = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${ano}`;

                return (
                  <button
                    key={mes}
                    onClick={() => setMesAtivo(mes)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${mes === mesAtivo
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                  >
                    {nomeFormatado}
                  </button>
                );
              })}
            </div>

            {/* Subscriptions List */}
            <div className="space-y-4">
              {agrupado[mesAtivo]?.map((item) => {
                const [mesNumero, ano] = mesAtivo.split("/");
                const anoMes = `${ano}-${mesNumero.padStart(2, "0")}`;
                const estaPaga = item.pagos?.[anoMes] ?? false;

                const hoje = new Date();
                const dataVencimento = item.data.toDate();

                let statusPagamento = "pendente";
                if (estaPaga) {
                  statusPagamento = "pago";
                } else if (dataVencimento < hoje) {
                  statusPagamento = "vencido";
                }

                const dataVencimentoFormatada = dataVencimento.toLocaleDateString("pt-BR");

                return (
                  <div
                    key={item.id}
                    className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{item.nome}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusPagamento === "pago"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : statusPagamento === "pendente"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                          >
                            {statusPagamento === "pago"
                              ? "Pago"
                              : statusPagamento === "pendente"
                                ? "Pendente"
                                : "Vencido"}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-purple-300 mb-1">
                          {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-gray-400 text-sm mb-1">
                          Parcela {item.parcelaAtual} de {item.quantidadeParcelas}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Vence em {dataVencimentoFormatada}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTogglePagoPorMes(item.id, anoMes, !estaPaga)}
                          className={`p-3 rounded-xl transition-all duration-200 ${estaPaga
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20"
                            }`}
                          title={estaPaga ? "Pago" : "Marcar como pago"}
                        >
                          <CheckCircle size={20} />
                        </button>

                        <button
                          onClick={() => handleDeletar(item.id)}
                          className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all duration-200"
                          title="Deletar"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}