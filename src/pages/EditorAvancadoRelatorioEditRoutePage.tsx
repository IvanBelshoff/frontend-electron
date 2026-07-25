import { useParams } from '@tanstack/react-router'
import EditorAvancadoRelatorioPage from '@/pages/EditorAvancadoRelatorioPage'

export default function EditorAvancadoRelatorioEditRoutePage() {
  const { relatorioId } = useParams({ strict: false })
  return <EditorAvancadoRelatorioPage relatorioId={Number(relatorioId)} />
}
