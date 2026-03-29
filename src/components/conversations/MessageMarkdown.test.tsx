import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageMarkdown } from './MessageMarkdown'

describe('MessageMarkdown', () => {
  it('renders bold, headings, horizontal rule, lists, and code', () => {
    const md = [
      '**bold phrase**',
      '',
      '## Section',
      '',
      '---',
      '',
      '- list one',
      '1. ordered item',
      '',
      'Inline `x` code.',
      '',
      '```',
      'block()',
      '```',
    ].join('\n')

    const { container } = render(<MessageMarkdown content={md} />)

    const strong = screen.getByText('bold phrase')
    expect(strong.tagName).toBe('STRONG')

    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument()

    expect(container.querySelector('hr')).toBeTruthy()

    expect(screen.getByText('list one')).toBeInTheDocument()
    expect(screen.getByText('ordered item')).toBeInTheDocument()

    expect(screen.getByText('x')).toBeInTheDocument()

    expect(screen.getByText(/block\(\)/)).toBeInTheDocument()
  })
})
