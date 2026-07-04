import type {
  ManagedUser,
  ManagedUserApiRecord,
  ManagedUserPermissionLink,
} from './user-list-types'
import type { UserEditDraft } from './user-edit-types'
import type { UserPhoto } from './user-types'

function mapUserPhotoFromApi(
  foto: ManagedUserApiRecord['foto'],
): UserPhoto | null {
  if (!foto) {
    return null
  }

  return {
    id: Number(foto.id),
    nome: foto.nome,
    local: foto.local,
    type: foto.type ?? foto.tipo,
  }
}

function mapPermissionsWithRules(
  permissoes: ManagedUserApiRecord['permissao'],
): ManagedUserPermissionLink[] {
  if (!permissoes?.length) {
    return []
  }

  const deduped = new Map<string, ManagedUserPermissionLink>()

  permissoes.forEach((permissao) => {
    const nome = permissao.nome?.trim()
    if (!nome) {
      return
    }

    const regraNome =
      permissao.regra?.nome && permissao.regra.nome.trim().length > 0
        ? permissao.regra.nome.trim()
        : undefined

    const key = `${nome}::${regraNome ?? ''}`
    deduped.set(key, { nome, regraNome })
  })

  return Array.from(deduped.values())
}

export function mapManagedUserFromApi(record: ManagedUserApiRecord): ManagedUser {
  return {
    id: Number(record.id),
    nome: record.nome,
    sobrenome: record.sobrenome,
    email: record.email,
    bloqueado: record.bloqueado,
    ultimoLogin: record.ultimo_login ?? null,
    dataCriacao: record.data_criacao ?? null,
    dataAtualizacao: record.data_atualizacao ?? null,
    usuarioCadastrador: record.usuario_cadastrador ?? null,
    usuarioAtualizador: record.usuario_atualizador ?? null,
    regras: (record.regra ?? []).map((regra) => regra.nome),
    permissoes: (record.permissao ?? []).map((permissao) => permissao.nome),
    permissoesDetalhadas: mapPermissionsWithRules(record.permissao),
    foto: mapUserPhotoFromApi(record.foto),
  }
}

export function mapManagedUserListFromApi(records: ManagedUserApiRecord[]): ManagedUser[] {
  return records.map(mapManagedUserFromApi)
}

export function mapManagedUserToEditDraft(user: ManagedUser): UserEditDraft {
  return {
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    bloqueado: user.bloqueado,
  }
}
