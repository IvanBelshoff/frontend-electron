import { describe, expect, it } from 'vitest'
import {
  describeRoleAccess,
  mergeRoleCatalogWithEnvDefinitions,
} from './user-permissions-mapper'
import type { UserRuleOption } from './user-permissions-types'

const apiCatalog: UserRuleOption[] = [
  {
    id: 2,
    nome: 'REGRA_USUARIO',
    permissoes: [
      { id: 10, nome: 'PERMISSAO_CRIAR_USUARIO', regraId: 2, regraNome: 'REGRA_USUARIO' },
      { id: 11, nome: 'PERMISSAO_ATUALIZAR_USUARIO', regraId: 2, regraNome: 'REGRA_USUARIO' },
    ],
  },
  {
    id: 5,
    nome: 'REGRA_IA',
    permissoes: [],
  },
]

describe('mergeRoleCatalogWithEnvDefinitions', () => {
  it('merges REGRA_IA with empty permissions from API', () => {
    const merged = mergeRoleCatalogWithEnvDefinitions(apiCatalog, {
      REGRA_USUARIO: ['PERMISSAO_CRIAR_USUARIO', 'PERMISSAO_ATUALIZAR_USUARIO'],
      REGRA_IA: [],
    })

    const iaRule = merged.find((rule) => rule.nome === 'REGRA_IA')

    expect(iaRule).toMatchObject({
      id: 5,
      nome: 'REGRA_IA',
      permissoes: [],
    })
  })

  it('includes env permissions missing from API as pending sync entries', () => {
    const merged = mergeRoleCatalogWithEnvDefinitions(apiCatalog, {
      REGRA_USUARIO: [
        'PERMISSAO_CRIAR_USUARIO',
        'PERMISSAO_ATUALIZAR_USUARIO',
        'PERMISSAO_EXCLUIR_USUARIO',
      ],
      REGRA_IA: [],
    })

    const usuarioRule = merged.find((rule) => rule.nome === 'REGRA_USUARIO')
    const excluirUsuario = usuarioRule?.permissoes.find(
      (permission) => permission.nome === 'PERMISSAO_EXCLUIR_USUARIO',
    )

    expect(excluirUsuario).toMatchObject({
      nome: 'PERMISSAO_EXCLUIR_USUARIO',
      pendingSync: true,
      regraId: 2,
    })
    expect(excluirUsuario?.id).toBeLessThan(0)
  })
})

describe('describeRoleAccess', () => {
  it('describes REGRA_IA access', () => {
    expect(
      describeRoleAccess({
        id: 5,
        nome: 'REGRA_IA',
        permissoes: [],
      }),
    ).toBe('Permite usar o assistente de IA do DataDash.')
  })
})
