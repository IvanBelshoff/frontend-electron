import type { PreferenceFieldConfig } from '@/components/settings/preference-designer/preference-field.types'

export function createTableStyleSettingFields(): PreferenceFieldConfig[] {
  return [
    {
      kind: 'conditional',
      label: 'Exibir linhas de colunas?',
      layout: 'inline',
      showChildrenWhenDisabled: true,
      isEnabled: (value) => value.columnLines !== 'none',
      onEnable: () => ({ columnLines: 'header' }),
      onDisable: () => ({ columnLines: 'none' }),
      children: [
        {
          kind: 'segmented',
          key: 'columnLines',
          label: 'Onde exibir',
          ariaLabel: 'Onde exibir linhas de colunas',
          columns: 2,
          options: [
            { value: 'header', label: 'Somente cabeçalho' },
            { value: 'full', label: 'Tabela inteira' },
          ],
        },
      ],
    },
    {
      kind: 'group',
      id: 'table-style-toggles',
      layout: 'grid',
      columns: 3,
      children: [
        {
          kind: 'toggle',
          key: 'stripedRows',
          label: 'Cor alternada das linhas?',
          hint: 'Aplica fundo zebrado nas linhas da tabela.',
        },
        {
          kind: 'toggle',
          key: 'showRowLines',
          label: 'Exibir linhas horizontais?',
        },
        {
          kind: 'toggle',
          key: 'stickyHeader',
          label: 'Fixar cabeçalho ao rolar?',
        },
      ],
    },
  ]
}
