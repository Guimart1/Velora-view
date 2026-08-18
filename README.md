# 🌿 VELÖRA — Painel de Gestão Operacional & Telemetria Rodoviária

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Licença-FIAP%20Motiva-green)](#)

O **VELÖRA** é uma plataforma executiva e operacional desenvolvida para a **Motiva Rodovias**, projetada para otimizar o planejamento de roçagem de acostamentos rodoviários com base em dados de telemetria IoT, análise climática e predição de crescimento da vegetação.

> 🎓 **Projeto Acadêmico FIAP**  
> **Integrantes:** Grupo 43  
> **Turma:** 2 CCPX  
> **Parceiro de Negócio:** Motiva Rodovias  

---

## 📸 Recursos do Painel

* **🛡️ Painel de Controle Operacional:** Apresenta o número de trechos críticos, setores de maior urgência e janela de oportunidade climática sem chuva.
* **🏆 Ranking Dinâmico de Prioridade:** Ordenação automatizada dos trechos em **ALTA** (vermelho), **MÉDIA** (âmbar) e **BAIXA** (verde) com destaque lateral e alertas de ordens vencidas.
* **☀️ Recomendação Climática Interativa:** Analisa dados meteorológicos das próximas 72h (Open-Meteo) e sugere a data ideal para o agendamento da roçagem em 1 clique.
* **📈 Histórico & Projeções de Crescimento:** Gráfico com medição real do sensor (linha sólida) e projeção de crescimento (linha pontilhada) contra a linha de limite permitido do acostamento.
* **🗺️ Geolocalização em Tela Cheia:** Mapa interativo em alta definição com **CartoDB Dark Matter**, marcadores por prioridade e popup detalhado por trecho.
* **✂️ Gestão de Manutenções por Rodovia:** Histórico filtrável por **Rodovia**, **Equipe Responsável**, **Período de Data** e busca por texto livre.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, Leaflet / React-Leaflet.
* **Identidade Visual:** Paleta industrial escura (`#0B0F14`, `#1E242C`) com cor de acento oficial **Verde Limão VELÖRA (`#B5FF57`)**.

---

## ⚡ Como Rodar o Projeto Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**
* Backend FastAPI rodando em `http://127.0.0.1:8000` (Repositório Backend)

### 1. Clonar o Repositório
```bash
git clone https://github.com/Guimart1/Velora-view.git
cd Velora-view
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar a Variável de Ambiente (Opcional)
Se o backend não estiver rodando na porta padrão `8000`, crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```

Acesse no navegador: **[http://localhost:5173](http://localhost:5173)**

### 5. Compilar para Produção (Build)
```bash
npm run build
```

Os arquivos compilados serão gerados na pasta `dist/`.
