import React from 'react'

import useSetState from '../../hooks/useSetState'
import { PermissionPrinperm } from './permissions_prinperm'
import { PermissionPrinrole } from './permissions_prinrole'
import { PermissionRoleperm } from './permissions_roleperm'
import { Select } from '../input/select'
import { Sharing } from '../../models'
import { Table } from '../ui/table'
import { useCrudContext } from '../../hooks/useCrudContext'
import { useTraversal } from '../../contexts'

export function PanelPermissions() {
  const { get, result, loading } = useCrudContext()
  const ctx = useTraversal()

  const [reset, setReset] = React.useState(1)

  React.useEffect(() => {
    get('@sharing')
  }, [reset])

  const perms = new Sharing(result)

  return (
    <div className="columns">
      {!loading && (
        <div
          className="column is-8 is-size-7 permissions"
          data-test="containerPermissionsInfoTest"
        >
          <h2 className="title is-size-5 has-text-grey-dark">
            Role Permissions
          </h2>
          <Table headers={['Role', 'Premission', 'Setting']}>
            {perms.roles.map((role, idx) => (
              <React.Fragment key={'ff' + idx}>
                <tr>
                  <td colSpan="3" className="has-text-link">
                    {role}
                  </td>
                  {/* <td>
                    <Icon icon="fas fa-ban" />
                    <span>Remove</span>
                  </td> */}
                </tr>
                {Object.keys(perms.getRole(role)).map((row, idx) => (
                  <tr key={'k' + idx}>
                    <td></td>
                    <td>{row}</td>
                    <td>{perms.getRole(role)[row]}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {perms.roles.length === 0 && (
              <tr>
                <td colSpan="3">No roles permissions defined</td>
              </tr>
            )}
          </Table>
          <h2 className="title is-size-5 has-text-grey-dark">
            Principal Permissions
          </h2>
          <Table headers={['Principal', 'Premission', 'Setting']}>
            {perms.principals.map((role, idx) => (
              <React.Fragment key={'f2' + idx}>
                <tr>
                  <td colSpan="3" className="has-text-link">
                    {role}
                  </td>
                </tr>
                {Object.keys(perms.getPrincipals(role)).map((row, idx) => (
                  <tr key={'x' + idx}>
                    <td></td>
                    <td>{row}</td>
                    <td>{perms.getPrincipals(role)[row]}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {perms.principals.length === 0 && (
              <tr>
                <td colSpan="3">No principals permissions defined</td>
              </tr>
            )}
          </Table>
          <h2 className="title is-size-5 has-text-grey-dark">
            Principal Roles
          </h2>
          <Table headers={['Principal', 'Role', 'Setting']}>
            {perms.prinrole.map((role, idx) => (
              <React.Fragment key={role + idx}>
                <tr>
                  <td colSpan="3" className="has-text-link">
                    {role}
                  </td>
                </tr>
                {Object.keys(perms.getPrinroles(role)).map((row, idx) => (
                  <tr key={'xx' + idx}>
                    <td></td>
                    <td>{row}</td>
                    <td>{perms.getPrinroles(role)[row]}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {perms.prinrole.length === 0 && (
              <tr>
                <td colSpan="3">No principals roles defined</td>
              </tr>
            )}
          </Table>
        </div>
      )}
      {ctx.hasPerm('guillotina.ChangePermissions') && (
        <AddPermission refresh={setReset} reset={reset} />
      )}
    </div>
  )
}

const initial = {
  permissions: undefined,
  roles: [],
  principals: undefined,
  current: '',
  currentObj: undefined,
}

const operations = [
  { text: 'Allow', value: 'Allow' },
  { text: 'Deny', value: 'Deny' },
  { text: 'AllowSingle', value: 'AllowSingle' },
  { text: 'Unset', value: 'Unset' },
]

const defaultOptions = [
  { text: 'Choose..', value: '' },
  { text: 'Role Permissions', value: 'roleperm' },
  { text: 'Principal Permissions', value: 'prinperm' },
  { text: 'Principal Roles', value: 'prinrole' },
]

export function AddPermission({ refresh, reset }) {
  const Ctx = useTraversal()
  const [state, setState] = useSetState(initial)

  React.useEffect(() => {
    async function init() {
      const permissions = (await Ctx.client.getAllPermissions(Ctx.path)).map(
        (perm) => ({
          text: perm,
          value: perm,
        })
      )
      let principals = []
      let roles = []

      let principalsData = await Ctx.client.getPrincipals(Ctx.path)
      const groups = principalsData.groups.map((group) => ({
        text: group.id,
        value: group.id,
      }))
      const users = principalsData.users.map((user) => ({
        text: user.fullname,
        value: user.id,
      }))
      principals = [...groups, ...users]

      const req = await Ctx.client.getRoles(Ctx.path)
      if (req.ok) {
        roles = (await req.json()).map((role) => ({
          text: role,
          value: role,
        }))
      }
      setState({ permissions, roles, principals })
    }

    init()
  }, [reset])

  return (
    <div className="column is-4 is-size-7">
      <h1 className="title is-size-5">Add Permissions</h1>
      <p>Select a type:</p>
      <Select
        options={defaultOptions}
        onChange={(v) => setState({ current: v.target.value })}
        dataTest="selectPermissionTypeTest"
      />
      <hr />
      {state.current && state.current === 'roleperm' && (
        <PermissionRoleperm
          {...state}
          operations={operations}
          refresh={refresh}
        />
      )}
      {state.current && state.current === 'prinperm' && (
        <PermissionPrinperm
          {...state}
          operations={operations}
          refresh={refresh}
        />
      )}
      {state.current && state.current === 'prinrole' && (
        <PermissionPrinrole
          {...state}
          operations={operations}
          refresh={refresh}
        />
      )}
    </div>
  )
}
