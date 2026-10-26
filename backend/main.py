import json
import os
from io import BytesIO

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("A chave da API do Gemini não foi configurada.")

genai.configure(api_key=api_key)

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={"response_mime_type": "application/json"}
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages).strip()


def extract_resume_data(text: str) -> dict:
    prompt = f"""
    Analise o currículo abaixo e identifique as seguintes informações:
    nome, email, telefone e profissao.

    Retorne um objeto JSON contendo exatamente essas quatro chaves.
    Caso alguma informação não esteja presente, utilize null.
    Não invente informações que não estejam no documento.

    Currículo:
    {text}
    """

    response = model.generate_content(prompt)
    data = json.loads(response.text)

    if not isinstance(data, dict):
        raise ValueError("A resposta da IA não contém um objeto JSON.")

    fields = ("nome", "email", "telefone", "profissao")
    result = {}

    for field in fields:
        value = data.get(field)
        result[field] = value if isinstance(value, str) else None

    return result


@app.get("/")
def read_root():
    return {"message": "API está funcionando"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Selecione um arquivo PDF válido."
        )

    content = await file.read()

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é um PDF válido."
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="O arquivo deve ter no máximo 10 MB."
        )

    try:
        text = extract_pdf_text(content)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível ler o conteúdo do PDF."
        )

    if not text:
        raise HTTPException(
            status_code=422,
            detail="Nenhum texto foi encontrado no documento."
        )

    try:
        resume_data = extract_resume_data(text)

    except (ValueError, json.JSONDecodeError):
        raise HTTPException(
            status_code=502,
            detail="A IA retornou uma resposta inválida."
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Erro ao consultar o serviço de IA."
        )

    return {
        "status": "success",
        "file_name": file.filename,
        "extracted_data": resume_data
    }
