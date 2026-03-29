import { describe, it, expect } from 'vitest'
import {
  modelDisplayLabel,
  matchesModelFilter,
  uniqueModelFilterLabels,
} from './modelFilter'

describe('modelDisplayLabel', () => {
  it('maps gpt-4 variants to GPT-4', () => {
    expect(modelDisplayLabel('gpt-4')).toBe('GPT-4')
    expect(modelDisplayLabel('gpt-4-0613')).toBe('GPT-4')
    expect(modelDisplayLabel('gpt-4-browsing')).toBe('GPT-4')
  })

  it('maps gpt-4o before gpt-4', () => {
    expect(modelDisplayLabel('gpt-4o')).toBe('GPT-4o')
    expect(modelDisplayLabel('gpt-4o-mini')).toBe('GPT-4o')
  })

  it('uses path tail for unknown models', () => {
    expect(modelDisplayLabel('org/custom-model')).toBe('custom-model')
  })
})

describe('uniqueModelFilterLabels', () => {
  it('deduplicates raw variants that share a display label', () => {
    const out = uniqueModelFilterLabels([
      'gpt-4',
      'gpt-4-0613',
      'gpt-4o',
      'gpt-4o-mini',
    ])
    expect(out).toEqual(['GPT-4', 'GPT-4o'])
  })
})

describe('matchesModelFilter', () => {
  it('matches any raw variant when a display label is selected', () => {
    const selected = new Set(['GPT-4'])
    expect(matchesModelFilter('gpt-4-0613', selected)).toBe(true)
    expect(matchesModelFilter('gpt-4-browsing', selected)).toBe(true)
    expect(matchesModelFilter('gpt-4o', selected)).toBe(false)
  })

  it('passes all when nothing selected', () => {
    expect(matchesModelFilter('anything', new Set())).toBe(true)
  })
})
