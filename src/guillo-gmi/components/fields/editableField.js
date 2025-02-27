import React from 'react'
import { Button } from '../input/button'
import { useCrudContext } from '../../hooks/useCrudContext'
import { useConfig } from '../../hooks/useConfig'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { Icon } from '../ui'
import { get } from '../../lib/utils'

export function EditableField({
  field,
  value,
  ns,
  schema = undefined,
  modifyContent,
  required,
}) {
  const ref = useRef()
  const [isEdit, setEdit] = useState(false)
  const [val, setValue] = useState(value)
  const { patch, loading, Ctx } = useCrudContext()
  const { fieldHaveDeleteButton } = useConfig()

  const EditComponent = Ctx.registry.get('components', 'EditComponent')
  const RenderFieldComponent = Ctx.registry.get(
    'components',
    'RenderFieldComponent'
  )

  useEffect(() => {
    if (isEdit && ref.current) {
      ref.current.focus()
    }
  })

  const canModified = modifyContent && !get(schema, 'readonly', false)

  const saveField = async (ev) => {
    if (ev) ev.preventDefault()

    if (!field) {
      Ctx.flash(`Provide a key name!`, 'danger')
      return
    }

    if (!val && required) {
      Ctx.flash(`${field} is mandatory!`, 'danger')
      return
    }

    if (schema?.widget === 'file') {
      const value = val
      if (value) {
        value['filename'] = unescape(encodeURIComponent(value['filename']))
      }
      const endpoint = `${Ctx.path}@upload/${field}`
      const req = await Ctx.client.upload(endpoint, value)
      if (req.status !== 200) {
        Ctx.flash(`Failed to upload file ${field}!`, 'danger')
      } else {
        Ctx.flash(`${field} uploaded!`, 'success')
      }
    } else {
      const data = ns ? { [ns]: { [field]: val } } : { [field]: val }
      const dataPatch = await patch(data)
      if (dataPatch.isError) {
        Ctx.flash(`Error in field ${field}!`, 'danger')
      } else {
        Ctx.flash(`Field ${field}, updated!`, 'success')
      }
    }

    setEdit(false)
    Ctx.refresh()
  }

  const deleteField = async (ev) => {
    if (ev) ev.preventDefault()
    if (schema?.widget === 'file') {
      if (!field || (!val && required)) {
        Ctx.flash(`You can't delete ${field}!`, 'danger')
        return
      }

      const data = ns ? { [ns]: { [field]: null } } : { [field]: null }
      const dataPatch = await patch(data)
      if (dataPatch.isError) {
        Ctx.flash(`Error in field ${field}!`, 'danger')
      } else {
        Ctx.flash(`Field ${field}, deleted!`, 'success')
      }

      setEdit(false)
      Ctx.refresh()
    } else if (schema?.type === 'string' && schema?.enum) {
      setValue(null)
    } else if (schema?.type === 'array' && schema?.items.type === 'string') {
      setValue([])
    }
  }

  return (
    <React.Fragment>
      {!isEdit && (
        <div
          className={canModified ? 'editable' : ''}
          onClick={() => {
            setEdit(!!canModified)
          }}
          data-test={`editableFieldTest-${field}`}
        >
          <RenderFieldComponent
            schema={schema}
            field={field}
            val={val}
            modifyContent={modifyContent}
          />
          {canModified && <Icon icon="fas fa-edit" />}
        </div>
      )}

      {isEdit && (
        <div className="field" data-test={`editableFieldTest-${field}`}>
          <div className="control">
            <EditComponent
              ref={ref}
              schema={schema}
              val={val}
              setValue={setValue}
              dataTest={`editableFieldEditTest`}
            />
          </div>
          <div className="field is-grouped">
            <div className="control">
              <Button
                className="is-small is-primary"
                loading={loading}
                onClick={saveField}
                dataTest="editableFieldBtnSaveTest"
              >
                Save
              </Button>
            </div>
            <div className="control">
              <Button
                className="is-small"
                onClick={() => setEdit(false)}
                dataTest="editableFieldBtnCancelTest"
              >
                Cancel
              </Button>
            </div>
            {!required && fieldHaveDeleteButton(schema) && (
              <div className="control">
                <Button
                  className="is-small is-danger"
                  onClick={deleteField}
                  dataTest="editableFieldBtnDeleteTest"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  )
}
