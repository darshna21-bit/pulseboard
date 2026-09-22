import { useEffect, useRef } from 'react'

export interface UseKeyboardShortcutsOptions {
  searchInputRef: React.RefObject<HTMLInputElement | null>
  searchValue: string
  onClearSearch: () => void
}

/**
 * useKeyboardShortcuts
 * Manages global keyboard navigation:
 * - Pressing '/' anywhere on the page focuses the search bar (ignoring when another input/textarea/select is active).
 * - Pressing 'Escape' clears search text if non-empty, or blurs the search input if focused.
 */
export function useKeyboardShortcuts({
  searchInputRef,
  searchValue,
  onClearSearch,
}: UseKeyboardShortcutsOptions): void {
  const searchValueRef = useRef(searchValue)
  const onClearSearchRef = useRef(onClearSearch)

  useEffect(() => {
    searchValueRef.current = searchValue
    onClearSearchRef.current = onClearSearch
  }, [searchValue, onClearSearch])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeEl = document.activeElement
      const isSearchInput = activeEl === searchInputRef.current
      const isAnyInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable)

      // Shortcut: '/' focuses the search bar if no input is currently focused
      if (event.key === '/') {
        if (isAnyInputActive) return
        event.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      // Shortcut: 'Escape' clears search text or blurs the search input
      if (event.key === 'Escape') {
        // If an input other than the search bar is active, don't hijack its Escape handling
        if (isAnyInputActive && !isSearchInput) return

        if (searchValueRef.current.length > 0) {
          event.preventDefault()
          onClearSearchRef.current()
        } else if (isSearchInput) {
          event.preventDefault()
          searchInputRef.current?.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchInputRef])
}
