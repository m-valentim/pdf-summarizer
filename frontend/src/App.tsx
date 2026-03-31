import { useState } from 'react'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Handler para seleção de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  // Handler para upload e processamento
  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecione um PDF primeiro!")
      return
    }

    setIsLoading(true)
    setResult('')

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Fazer a requisição para o back-end
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.status === "success") {
        // Limpar o texto retornado da formatação da IA
        const cleanText = data.extracted_data.replace(/```json/gi, '').replace(/```/g, '').trim();
        setResult(cleanText);
      } else {
        setResult("Erro na API: " + data.detail)
      }

    } catch (error) {
      setResult("Erro ao conectar com o servidor. O back-end está ligado?")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Leitor de Currículos com IA</h1>
      <p>Faça o upload de um PDF para extrair os dados principais.</p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        {isLoading ? 'Processando com IA...' : 'Extrair Dados'}
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', color: '#00ff00', borderRadius: '8px', overflowX: 'auto' }}>
          <h3>Dados Extraídos:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default App