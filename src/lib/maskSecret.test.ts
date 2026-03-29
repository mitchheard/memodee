import { describe, it, expect } from 'vitest'
import { maskSecret } from './maskSecret'

describe('maskSecret', () => {
  it('returns empty for blank input', () => {
    expect(maskSecret('')).toBe('')
    expect(maskSecret('   ')).toBe('')
  })

  it('shows at most the last four characters after an ellipsis', () => {
    expect(maskSecret('sk-proj-abcdefghijklmnop')).toBe('…mnop')
    expect(maskSecret('secret_very_long_token')).toBe('…oken')
  })

  it('allows shorter secrets to show full trimmed value (length ≤ 4)', () => {
    expect(maskSecret('ab')).toBe('…ab')
    expect(maskSecret('xyzw')).toBe('…xyzw')
  })

  it('trims whitespace before masking', () => {
    expect(maskSecret('  hello  ')).toBe('…ello')
  })
})
