import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Popover, PopoverAction, PopoverHeading, PopoverItem, PopoverList } from '../src/components/popover'

function render(open: boolean, align?: 'start' | 'end') {
  return renderToStaticMarkup(
    <Popover
      open={open}
      onOpenChange={vi.fn()}
      label="Columns"
      align={align}
      trigger={(props) => (
        <button type="button" {...props}>
          open
        </button>
      )}
    >
      <PopoverHeading title="Columns" action={<PopoverAction>Reset</PopoverAction>} />
      <PopoverList>
        <PopoverItem>
          <input type="checkbox" defaultChecked />
          <span>Option</span>
        </PopoverItem>
      </PopoverList>
    </Popover>,
  )
}

describe('Popover', () => {
  it('renders the trigger and an accessible panel when open', () => {
    const markup = render(true)
    expect(markup).toContain('chem-popover-root')
    expect(markup).toContain('role="group"')
    expect(markup).toContain('aria-label="Columns"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-haspopup="true"')
    expect(markup).toContain('chem-popover__item')
  })

  it('omits the panel while closed', () => {
    const markup = render(false)
    expect(markup).not.toContain('role="group"')
    expect(markup).toContain('aria-expanded="false"')
  })

  it('supports start alignment', () => {
    const markup = render(true, 'start')
    expect(markup).toContain('data-align="start"')
  })
})
