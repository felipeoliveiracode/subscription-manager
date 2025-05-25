import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

// Inicializa o app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência da coleção
const assinaturasCollection = collection(db, "assinaturas");

// Criar uma assinatura
export const criarAssinatura = async (assinatura) => {
  try {
    return await addDoc(assinaturasCollection, assinatura);
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    throw error;
  }
};

export const buscarAssinaturasPorUsuario = async (uid) => {
  try {
    const q = query(assinaturasCollection, where("uid", "==", uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    throw error;
  }
};

export const deletarAssinatura = async (id) => {
  try {
    const ref = doc(db, "assinaturas", id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Erro ao deletar assinatura:", error);
    throw error;
  }
};

export const marcarPagamentoMes = async (id, anoMes, pago) => {
  try {
    const ref = doc(db, "assinaturas", id);
    await updateDoc(ref, {
      [`pagos.${anoMes}`]: pago,
    });
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    throw error;
  }
};
