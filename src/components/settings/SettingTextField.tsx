import { useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maskSecret } from '@/lib/maskSecret'

export const SETTINGS_SAVE_TOAST_ID = 'settings-save'

const SAVED_TOAST_MS = 2000

type SettingTextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  inputType?: 'password' | 'text'
  /** When true, blurred non-empty values show a masked placeholder (last 4 chars only). */
  maskWhenSaved?: boolean
  hint?: ReactNode
}

export function SettingTextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputType = 'text',
  maskWhenSaved = false,
  hint,
}: SettingTextFieldProps) {
  const [focused, setFocused] = useState(false)
  const focusedRef = useRef(false)
  const baselineRef = useRef(value)

  const showMask = !focused && maskWhenSaved && value.trim().length > 0
  const displayValue = showMask ? maskSecret(value) : value

  const handleFocus = () => {
    toast.dismiss(SETTINGS_SAVE_TOAST_ID)
    focusedRef.current = true
    baselineRef.current = value
    setFocused(true)
  }

  const handleChange = (next: string) => {
    try {
      onChange(next)
    } catch {
      toast.error('Could not save settings. Storage may be full or unavailable.', {
        id: SETTINGS_SAVE_TOAST_ID,
        duration: 4000,
      })
    }
  }

  const handleBlur = () => {
    focusedRef.current = false
    setFocused(false)
    if (value !== baselineRef.current) {
      toast.success('Saved', { id: SETTINGS_SAVE_TOAST_ID, duration: SAVED_TOAST_MS })
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={showMask ? 'text' : inputType}
        placeholder={placeholder}
        value={displayValue}
        readOnly={showMask}
        onValueChange={(next) => {
          const maskedBlurred =
            !focusedRef.current && maskWhenSaved && value.trim().length > 0
          if (maskedBlurred) return
          handleChange(next)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {hint}
    </div>
  )
}
