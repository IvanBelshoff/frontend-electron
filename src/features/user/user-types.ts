export type UserPhoto = {
  id: number
  nome?: string
  local?: string
  type?: string
}

export type UserDetail = {
  id: number
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
  foto?: UserPhoto | null
}
