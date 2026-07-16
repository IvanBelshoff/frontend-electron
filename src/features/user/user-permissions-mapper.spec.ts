import { describe, expect, it } from 'vitest'
import { mergeRoleCatalogWithEnvDefinitions } from './user-permissions-mapper'
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
]

describe('mergeRoleCatalogWithEnvDefinitions', () => {
  it('includes env permissions missing from API as pending sync entries', () => {
    const merged = mergeRoleCatalogWithEnvDefinitions(apiCatalog, {
      REGRA_USUARIO: [
        'PERMISSAO_CRIAR_USUARIO',
        'PERMISSAO_ATUALIZAR_USUARIO',
        'PERMISSAO_USAR_IA',
      ],
    })

    const usuarioRule = merged.find((rule) => rule.nome === 'REGRA_USUARIO')
    const usarIa = usuarioRule?.permissoes.find(
      (permission) => permission.nome === 'PERMISSAO_USAR_IA',
    )

    expect(usuarioRule?.permissoes).toHaveLength(3)
    expect(usarIa).toMatchObject({
      nome: 'PERMISSAO_USAR_IA',
      pendingSync: true,
      regraId: 2,
    })
    expect(usarIa?.id).toBeLessThan(0)
  })

  it('uses API permission when env and backend are aligned', () => {
    const catalogWithIa: UserRuleOption[] = [
      {
        id: 2,
        nome: 'REGRA_USUARIO',
        permissoes: [
          {
            id: 99,
            nome: 'PERMISSAO_USAR_IA',
            regraId: 2,
            regraNome: 'REGRA_USUARIO',
          },
        ],
      },
    ]

    const merged = mergeRoleCatalogWithEnvDefinitions(catalogWithIa, {
      REGRA_USUARIO: ['PERMISSAO_USAR_IA'],
    })

    expect(merged[0]?.permissoes[0]).toMatchObject({
      id: 99,
      nome: 'PERMISSAO_USAR_IA',
    })
    expect(merged[0]?.permissoes[0]?.pendingSync).toBeUndefined()
  })
})
