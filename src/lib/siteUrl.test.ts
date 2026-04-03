import { describe, expect, it } from 'vitest'
import { normalizeSiteUrl } from './siteUrl'

describe('normalizeSiteUrl', () => {
  it('returns empty for null, undefined, or blank', () => {
    expect(normalizeSiteUrl(null)).toBe('')
    expect(normalizeSiteUrl(undefined)).toBe('')
    expect(normalizeSiteUrl('')).toBe('')
    expect(normalizeSiteUrl('  ')).toBe('')
  })

  it('trims and removes a trailing slash', () => {
    expect(normalizeSiteUrl('  https://memodee.app/  ')).toBe('https://memodee.app')
  })

  it('leaves URLs without trailing slash unchanged (aside from trim)', () => {
    expect(normalizeSiteUrl('https://memodee.app')).toBe('https://memodee.app')
  })
})
