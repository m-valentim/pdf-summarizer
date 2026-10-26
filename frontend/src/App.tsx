import { useState, type ChangeEvent } from 'react'

type ResumeData = {
  nome: string | null
  email: string | null
  telefone: string | null
  profissao: string | null
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null

    setFile(selectedFile)
    setResume(null)
    setError('')
  }

  async function handleUpload() {
    if (!file) {
      setError('Selecione um arquivo PDF para continuar.')
      return
    }

    if (file.type !== 'application/pdf' &&
        !file.name.toLowerCase().endsWith('.pdf')) {
      setError('O arquivo precisa estar no formato PDF.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError('')
    setResume(null)

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Não foi possível processar o arquivo.')
      }

      setResume(data.extracted_data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu erro inesperado.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: '40px auto',
      padding: 20,
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Leitor de Currículos com IA</h1>
      <p>Selecione um currículo em PDF para extrair as informações principais.</p>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{ padding: '10px 20px', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Processando...' : 'Extrair dados'}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: '#c62828', marginTop: 20 }}>
          {error}
        </p>
      )}

      {resume && (
        <div style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: '#f4f4f4',
          borderRadius: 6
        }}>
          <h2>Dados extraídos</h2>
          <p><strong>Nome:</strong> {resume.nome || 'Não identificado'}</p>
          <p><strong>E-mail:</strong> {resume.email || 'Não identificado'}</p>
          <p><strong>Telefone:</strong> {resume.telefone || 'Não identificado'}</p>
          <p><strong>Profissão:</strong> {resume.profissao || 'Não identificada'}</p>
        </div>
      )}
    </div>
  )
}

export default App