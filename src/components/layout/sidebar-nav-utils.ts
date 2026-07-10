export type SidebarNavMatchPattern = string | RegExp

export type SidebarNavMatchRule = {
  to: string
  exact?: boolean
  alsoActiveOn?: SidebarNavMatchPattern[]
}

function matchesPattern(pathname: string, pattern: SidebarNavMatchPattern): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(pathname)
  }

  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -1)
    return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix)
  }

  return pathname === pattern
}

export function isSidebarNavActive(pathname: string, rule: SidebarNavMatchRule): boolean {
  const { to, exact = false, alsoActiveOn = [] } = rule

  if (exact) {
    if (pathname === to) {
      return true
    }
  } else if (pathname === to || pathname.startsWith(`${to}/`)) {
    return true
  }

  return alsoActiveOn.some((pattern) => matchesPattern(pathname, pattern))
}
