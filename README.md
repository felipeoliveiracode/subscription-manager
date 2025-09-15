
# Subscription Manager

Gerencie suas assinaturas de forma simples, visual e eficiente!

![Subscription Manager Banner](https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80)

## 🚀 Sobre o Projeto
O **Subscription Manager** é uma aplicação web desenvolvida em React para ajudar usuários a organizarem, visualizarem e controlarem suas assinaturas mensais (Netflix, Spotify, Amazon Prime, etc). Com uma interface moderna e intuitiva, permite o cadastro, agrupamento e visualização de gastos recorrentes, facilitando o controle financeiro pessoal.

## ✨ Principais Funcionalidades
- Cadastro e autenticação de usuários (Firebase Auth)
- Adição, edição e remoção de assinaturas
- Visualização de assinaturas agrupadas por mês
- Dashboard com resumo dos gastos
- Interface responsiva e amigável

## 🛠️ Tecnologias Utilizadas
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Firebase (Auth & Firestore)](https://firebase.google.com/)
- [JavaScript (ES6+)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- [CSS Moderno]

## 📁 Estrutura do Projeto
```
subscription-manager/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas principais (Dashboard, Login, Register)
│   ├── services/           # Integração com Firebase/Firestore
│   ├── utils/              # Funções utilitárias
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## 💡 Por que este projeto se destaca?
- **Foco em experiência do usuário:** UI moderna, responsiva e fácil de usar.
- **Boas práticas de código:** Componentização, organização e uso de hooks do React.
- **Integração real com backend:** Utilização do Firebase para autenticação e banco de dados em tempo real.
- **Pronto para escalar:** Estrutura preparada para novas features e fácil manutenção.

## 🧑‍💻 Como rodar o projeto localmente
1. Clone o repositório:
	```bash
	git clone https://github.com/felipeoliveiracode/subscription-manager.git
	```
2. Instale as dependências:
	```bash
	npm install
	```
3. Configure o Firebase:
	- Crie um projeto no [Firebase](https://firebase.google.com/)
	- Copie as credenciais para `src/firebaseConfig.js`
4. Inicie o projeto:
	```bash
	npm run dev
	```
5. Acesse em [http://localhost:5173](http://localhost:5173)

## 📣 Quer ver mais?
- Veja o código limpo, organizado e comentado.
- Experimente a interface intuitiva e responsiva.
- Pronto para demonstrações e entrevistas técnicas!

---

> Desenvolvido por [Felipe Oliveira](https://github.com/felipeoliveiracode) — Conecte-se comigo no [LinkedIn](https://www.linkedin.com/in/felipeoliveiracode/)
