import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { SettingTextField, SETTINGS_SAVE_TOAST_ID } from './SettingTextField'

const toastSuccess = vi.fn()
const toastError = vi.fn()
const toastDismiss = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
    dismiss: (...args: unknown[]) => toastDismiss(...args),
  },
}))

function ControlledField({
  initial = '',
  onChangeSpy,
  maskWhenSaved,
  inputType,
}: {
  initial?: string
  onChangeSpy?: (v: string) => void
  maskWhenSaved?: boolean
  inputType?: 'password' | 'text'
}) {
  const [v, setV] = useState(initial)
  return (
    <SettingTextField
      id="secret-field"
      label="Secret"
      value={v}
      onChange={(next) => {
        onChangeSpy?.(next)
        setV(next)
      }}
      maskWhenSaved={maskWhenSaved}
      inputType={inputType}
    />
  )
}

describe('SettingTextField', () => {
  beforeEach(() => {
    toastSuccess.mockClear()
    toastError.mockClear()
    toastDismiss.mockClear()
  })

  it('shows masked saved value when blurred and maskWhenSaved', () => {
    render(<ControlledField initial="sk-abcdefghijklmnop" maskWhenSaved />)

    const input = screen.getByLabelText('Secret') as HTMLInputElement
    expect(input.value).toBe('…mnop')
    expect(input).toHaveAttribute('readonly')
  })

  it('dismisses save toast and shows full value on focus', () => {
    render(<ControlledField initial="sk-abcdefghijklmnop" maskWhenSaved inputType="password" />)

    const input = screen.getByLabelText('Secret') as HTMLInputElement
    fireEvent.focus(input)

    expect(toastDismiss).toHaveBeenCalledWith(SETTINGS_SAVE_TOAST_ID)
    expect(input).toHaveValue('sk-abcdefghijklmnop')
    expect(input).not.toHaveAttribute('readonly')
  })

  it('calls onChange and success toast when value changes then blurs', () => {
    const onChangeSpy = vi.fn()
    render(<ControlledField initial="old" onChangeSpy={onChangeSpy} maskWhenSaved />)

    const input = screen.getByLabelText('Secret')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'new-value' } })
    fireEvent.blur(input)

    expect(onChangeSpy).toHaveBeenCalledWith('new-value')
    expect(toastSuccess).toHaveBeenCalledWith(
      'Saved',
      expect.objectContaining({ id: SETTINGS_SAVE_TOAST_ID, duration: 2000 })
    )
  })

  it('does not toast when unchanged on blur', () => {
    render(<ControlledField initial="same" maskWhenSaved />)

    const input = screen.getByLabelText('Secret')
    fireEvent.focus(input)
    fireEvent.blur(input)

    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('shows error toast when onChange throws', () => {
    render(
      <SettingTextField
        id="secret-field"
        label="Secret"
        value="x"
        onChange={() => {
          throw new Error('quota')
        }}
        maskWhenSaved
      />
    )

    const input = screen.getByLabelText('Secret')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'y' } })

    expect(toastError).toHaveBeenCalledWith(
      'Could not save settings. Storage may be full or unavailable.',
      expect.objectContaining({ id: SETTINGS_SAVE_TOAST_ID })
    )
  })
})
