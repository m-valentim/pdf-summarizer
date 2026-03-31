# 📄 Leitor de Currículos com IA

Uma Prova de Conceito (PoC) Full Stack desenvolvida para automatizar a leitura e extração de dados estruturados de documentos PDF utilizando Inteligência Artificial.

## 🎯 Objetivo do Projeto
Demonstrar a integração de um front-end em React com uma API em Python, capaz de receber arquivos PDF, processá-los e utilizar agentes de LLM para retornar informações em formato JSON. 

<img src="./preview.png" alt="Demonstração do Leitor de Currículos" width="800">

## 💻 Tecnologias Utilizadas

**Front-end:**
* **React.js** com **TypeScript**.
* **Vite**.

**Back-end:**
* **Python** com **FastAPI**.
* **PyPDF2** (Manipulação e extração de texto).
* **Google Generative AI (Gemini 2.5 Flash)** (Processamento de linguagem natural e extração de dados).

## ⚙️ Arquitetura e Fluxo de Dados
1. O usuário faz o upload de um currículo/documento via interface React.
2. O Front-end empacota o arquivo usando `FormData` e envia via requisição `POST` para a API.
3. O FastAPI recebe o arquivo e utiliza o `PyPDF2` para extrair o conteúdo textual de todas as páginas.
4. O texto bruto é enviado via prompt estruturado para a API do Gemini, instruindo a extração de informações específicas (Nome, Email, Telefone, Profissão).
5. A IA retorna um JSON estruturado, que é devolvido pela API e renderizado dinamicamente na tela do usuário.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js instalado.
* Python 3.8+ instalado.
* Uma chave de API válida do Google AI Studio.

### 1. Configurando o Back-end (API)
Navegue até a pasta do back-end, crie seu ambiente virtual e instale as dependências:
```bash
cd backend
python -m venv venv
venv\Scripts\activate # Se for para Windows. Em caso de Linux/Mac: source venv/bin/activate
pip install fastapi uvicorn pypdf2 python-multipart google-generativeai
```
Obs: Lembre-se de inserir sua API Key no arquivo main.py em API_KEY = "YOUR_GOOGLE_API_KEY". Obtenha a API Key em [Google AI Studio](https://aistudio.google.com/).

Inicie o servidor local:

```bash
uvicorn main:app --reload
```

A API estará rodando em http://localhost:8000.

### 2. Configurando o Front-end (React)
Em um novo terminal, navegue até a pasta do front-end e instale as dependências:

```bash
cd frontend
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse a aplicação no seu navegador através do link gerado (geralmente http://localhost:5173).