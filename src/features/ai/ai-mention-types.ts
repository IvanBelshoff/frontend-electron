export type AiMentionType =
  | 'relatorio'
  | 'dashboard'
  | 'usuario'
  | 'dominio_relatorios'
  | 'dominio_dashboards'
  | 'dominio_usuarios'

export type AiMention = {
  type: AiMentionType
  id?: number
  label: string
}

export type AiMentionCategoryId = 'relatorios' | 'dashboards' | 'usuarios'

export type AiMentionCategory = {
  id: AiMentionCategoryId
  label: string
  domainMention: AiMention
}

export type AiMentionListItem = {
  id: number
  label: string
  mention: AiMention
}

export function mentionKey(mention: AiMention): string {
  return mention.id != null ? `${mention.type}:${mention.id}` : mention.type
}

export function formatMentionChip(mention: AiMention): string {
  switch (mention.type) {
    case 'relatorio':
      return `@Relatório: ${mention.label}`
    case 'dashboard':
      return `@Dashboard: ${mention.label}`
    case 'usuario':
      return `@Usuário: ${mention.label}`
    case 'dominio_relatorios':
      return '@Relatórios'
    case 'dominio_dashboards':
      return '@Dashboards'
    case 'dominio_usuarios':
      return '@Usuários'
    default:
      return `@${mention.label}`
  }
}
