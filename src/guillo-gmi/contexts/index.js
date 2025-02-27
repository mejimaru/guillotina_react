import React from 'react'
import { createContext } from 'react'

export const AuthContext = createContext({})

export const ClientContext = createContext({})

export const TraversalContext = createContext({})

class Traversal {
  constructor({ flash, ...props }) {
    Object.assign(this, props)
    if (typeof flash === 'function') this.flash = flash
  }

  refresh({ transparent = false } = {}) {
    this.dispatch({ type: 'REFRESH', payload: { transparent } })
  }

  get path() {
    return this.state.path
  }

  get pathPrefix() {
    return this.state.path.slice(1)
  }

  get context() {
    return this.state.context
  }

  get containerPath() {
    return this.client.getContainerFromPath(this.path)
  }

  apply(data) {
    // apply a optimistic update to context
    this.dispatch({ type: 'APPLY', payload: data })
  }

  flash(message, type) {
    this.dispatch({ type: 'SET_FLASH', payload: { flash: { message, type } } })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  clearFlash() {
    this.dispatch({ type: 'CLEAR_FLASH' })
  }

  doAction(action, params) {
    this.dispatch({ type: 'SET_ACTION', payload: { action, params } })
  }

  cancelAction() {
    this.dispatch({ type: 'CLEAR_ACTION' })
  }

  hasPerm(permission) {
    return this.state.permissions[permission] === true
  }

  filterTabs(tabs, tabsPermissions) {
    const result = {}
    Object.keys(tabs).forEach((item) => {
      const perm = tabsPermissions[item]
      if (perm && this.hasPerm(perm)) {
        result[item] = tabs[item]
      } else if (!perm) {
        result[item] = tabs[item]
      }
    })
    return result
  }
}

export function TraversalProvider({ children, ...props }) {
  return (
    <TraversalContext.Provider value={new Traversal(props)}>
      {children}
    </TraversalContext.Provider>
  )
}

export function useTraversal() {
  return React.useContext(TraversalContext)
}

export function ClientProvider({ children, client }) {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  )
}

export function useGuillotinaClient() {
  return React.useContext(ClientContext)
}
