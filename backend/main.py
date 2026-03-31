from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import google.generativeai as genai

# Configuração da IA
API_KEY = "YOUR_GOOGLE_API_KEY"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Testar endpoint da API
@app.get("/")
def read_root():
    return {"message": "API do pdf-summarizer rodando com sucesso!"}

@app.post("/upload")
async def process_pdf_with_ai(file: UploadFile = File(...)):
    try:
        # Ler o PDF e extrair texto
        pdf_reader = PyPDF2.PdfReader(file.file)
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text()
            
        # Prompt para a IA
        prompt = f"""
        Você é um assistente de extração de dados. Leia o texto de currículo abaixo e 
        extraia as seguintes informações: Nome, Email, Telefone, e Profissão principal.
        Retorne APENAS um objeto JSON válido, sem formatações adicionais ou textos de explicação.
        
        Texto do documento:
        {extracted_text}
        """
        
        # Enviar o prompt para a IA
        response = model.generate_content(prompt)
        
        # Retornar resposta em JSON
        return {
            "status": "success", 
            "file_name": file.filename, 
            "extracted_data": response.text
        }
    
    except Exception as e:
        return {"status": "error", "detail": str(e)}