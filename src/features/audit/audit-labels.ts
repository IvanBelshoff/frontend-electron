import type { AuditActorType, AuditCategory, AuditOutcome } from '@/features/audit/audit-types'

const ACTION_LABELS: Record<string, string> = {
  'auth.login.success': 'Login realizado',
  'auth.login.failure': 'Falha no login',
  'auth.logout': 'Logout realizado',

  'user.create': 'Usuário criado',
  'user.update': 'Usuário atualizado',
  'user.delete': 'Usuário excluído',
  'user.password.change': 'Senha alterada',
  'user.roles.update': 'Regras/permissões atualizadas',
  'user.dashboards.copy': 'Dashboards copiados',
  'user.relatorios.copy': 'Relatórios copiados',

  'connection.create': 'Conexão criada',
  'connection.update': 'Conexão atualizada',
  'connection.delete': 'Conexão excluída',
  'connection.test': 'Conexão testada',

  'dashboard.create': 'Dashboard criado',
  'dashboard.update': 'Dashboard atualizado',
  'dashboard.delete': 'Dashboard excluído',
  'dashboard.acl.assign': 'Acesso ao dashboard atribuído',

  'report.create': 'Relatório criado',
  'report.update': 'Relatório atualizado',
  'report.delete': 'Relatório excluído',
  'report.acl.assign': 'Acesso ao relatório atribuído',
  'report.acl.ia_knowledge.update': 'Conhecimento IA do relatório atualizado',
  'report.execute': 'Relatório executado',
  'report.snapshot_schedule.create': 'Agendamento de snapshot criado',
  'report.snapshot_schedule.delete': 'Agendamento de snapshot removido',

  'scheduler.create': 'Agendador criado',
  'scheduler.update': 'Agendador atualizado',
  'scheduler.delete': 'Agendador excluído',
  'scheduler.vinculo.create': 'Vínculo de agendamento criado',
  'scheduler.vinculo.delete': 'Vínculo de agendamento removido',
}

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  auth: 'Autenticação',
  user: 'Usuário',
  acl: 'Controle de acesso',
  dashboard: 'Dashboard',
  report: 'Relatório',
  connection: 'Conexão',
  scheduler: 'Agendador',
}

const OUTCOME_LABELS: Record<AuditOutcome, string> = {
  success: 'Sucesso',
  failure: 'Falha',
  denied: 'Negado',
}

export function getAuditActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

export function getAuditCategoryLabel(category: AuditCategory | string): string {
  return CATEGORY_LABELS[category as AuditCategory] ?? category
}

export function getAuditOutcomeLabel(outcome: AuditOutcome): string {
  return OUTCOME_LABELS[outcome]
}

export function getAuditActorLabel(
  actorType: AuditActorType,
  actorEmail: string | null,
): string {
  if (actorType === 'system') {
    return 'Sistema'
  }

  if (actorType === 'anonymous') {
    return 'Anônimo'
  }

  return actorEmail ?? 'Usuário'
}

export function getAuditResourceLabel(
  resourceType: string | null,
  resourceId: string | number | null,
): string {
  if (!resourceType) {
    return '—'
  }

  if (resourceId == null || resourceId === '') {
    return resourceType
  }

  return `${resourceType} #${resourceId}`
}
