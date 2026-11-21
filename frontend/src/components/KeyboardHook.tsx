import { useEffect, useState } from 'react'

// Hook for detecting soft keyboard visibility on mobile
// Uses the window.height comparison technique: if the document height
// decreases significantly while scrolling, the keyboard is likely visible

interface KeyboardHookResult {
  isKeyboardVisible: boolean
  keyboardHeight: number
}

/**
 * Hook that detects soft keyboard visibility on mobile devices.
 * 
 * Works by tracking the scroll event and comparing the document's
 * scrollHeight before and after. When the keyboard is visible,
 * the content area shrinks, which changes the scrollHeight.
 */
export function useKeyboardHook(): KeyboardHookResult {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [lastScrollHeight, setLastScrollHeight] = useState(0)

  useEffect(() => {
    // Initial scroll height
    setLastScrollHeight(document.body.scrollHeight)

    const handleScroll = () => {
      const currentScrollHeight = document.body.scrollHeight
      const delta = Math.abs(currentScrollHeight - lastScrollHeight)

      // If the scroll height decreased by more than 50 pixels,
      // the keyboard is likely visible
      if (delta > 50 && currentScrollHeight < lastScrollHeight) {
        setIsKeyboardVisible(true)
        setKeyboardHeight(delta)
      } else if (delta > 50 && currentScrollHeight > lastScrollHeight) {
        // Keyboard hidden - scroll height increased
        setIsKeyboardVisible(false)
        setKeyboardHeight(0)
      }

      setLastScrollHeight(currentScrollHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [lastScrollHeight])

  return { isKeyboardVisible, keyboardHeight }
}
