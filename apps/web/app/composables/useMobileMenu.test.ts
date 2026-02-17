import { describe, it, expect } from 'vitest'
import { useMobileMenu } from './useMobileMenu'

describe('useMobileMenu', () => {
  it('initializes with closed state', () => {
    const { isOpen, activeSection } = useMobileMenu()
    expect(isOpen.value).toBe(false)
    expect(activeSection.value).toBeUndefined()
  })

  it('open sets isOpen to true', () => {
    const { isOpen, open } = useMobileMenu()
    open()
    expect(isOpen.value).toBe(true)
  })

  it('close sets isOpen to false', () => {
    const { isOpen, open, close } = useMobileMenu()
    open()
    expect(isOpen.value).toBe(true)

    close()
    expect(isOpen.value).toBe(false)
  })

  it('toggle switches isOpen state', () => {
    const { isOpen, toggle } = useMobileMenu()

    toggle()
    expect(isOpen.value).toBe(true)

    toggle()
    expect(isOpen.value).toBe(false)
  })

  it('close also clears activeSection', () => {
    const { activeSection, open, close, setActiveSection } = useMobileMenu()
    open()
    setActiveSection('explore')
    expect(activeSection.value).toBe('explore')

    close()
    expect(activeSection.value).toBeUndefined()
  })

  it('setActiveSection updates active section', () => {
    const { activeSection, setActiveSection } = useMobileMenu()

    setActiveSection('explore')
    expect(activeSection.value).toBe('explore')

    setActiveSection('account')
    expect(activeSection.value).toBe('account')
  })

  it('toggleSection toggles between active and undefined', () => {
    const { activeSection, toggleSection } = useMobileMenu()

    toggleSection('explore')
    expect(activeSection.value).toBe('explore')

    toggleSection('explore')
    expect(activeSection.value).toBeUndefined()
  })

  it('toggleSection switches to different section', () => {
    const { activeSection, toggleSection } = useMobileMenu()

    toggleSection('explore')
    expect(activeSection.value).toBe('explore')

    toggleSection('account')
    expect(activeSection.value).toBe('account')
  })
})
