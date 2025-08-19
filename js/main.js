// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Loading Animation Hiding ---
  const loader = document.getElementById('loader')
  // Hide loader slightly after load event fires to ensure rendering
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Add a small delay
      if (loader) {
        loader.classList.add('hidden')
      }
    }, 100) // 100ms delay
  })
  // Fallback if load event takes too long
  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden')
    }
  }, 3000) // Hide after 3 seconds regardless

  // --- Dark Mode Toggle ---
  const darkModeToggle = document.getElementById('darkModeToggle')
  const body = document.body

  // Function to apply theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode')
    } else {
      body.classList.remove('dark-mode')
    }
    // Ensure localStorage is available before using it
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.error('LocalStorage is not available:', e)
    }
  }

  // Check initial theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  let savedTheme = null
  try {
    savedTheme = localStorage.getItem('theme')
  } catch (e) {
    console.error('LocalStorage is not available:', e)
  }

  if (savedTheme) {
    applyTheme(savedTheme)
  } else if (prefersDark) {
    applyTheme('dark')
  } else {
    applyTheme('light') // Default to light if no preference
  }

  // Toggle listener
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark'
      applyTheme(newTheme)
    })
  }

  // --- Hamburger Menu ---
  const menuToggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('header nav') // Ensure this selector is correct

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active')
      menuToggle.classList.toggle('active')
      // Optional: Prevent body scroll when menu is open
      // body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    })

    // Close menu when a link is clicked
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          nav.classList.remove('active')
          menuToggle.classList.remove('active')
          // body.style.overflow = ''; // Restore scroll
        }
      })
    })
  }

  // --- Fixed Header Glassmorphism on Scroll ---
  const header = document.getElementById('mainHeader')
  const scrollThreshold = 10 // Pixels to scroll before effect applies

  const handleScroll = () => {
    if (!header) return // Check if header exists
    // Use requestAnimationFrame to prevent layout thrashing
    window.requestAnimationFrame(() => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header-scrolled')
      } else {
        header.classList.remove('header-scrolled')
      }
    })
  }

  // Throttle scroll events for performance using requestAnimationFrame
  let isScrolling = false
  window.addEventListener(
    'scroll',
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          handleScroll()
          isScrolling = false
        })
        isScrolling = true
      }
    },
    { passive: true }
  )

  // Initial check in case page loads already scrolled
  handleScroll()

  // --- Intersection Observer for Scroll Animations ---
  const revealElements = document.querySelectorAll('.reveal')

  if ('IntersectionObserver' in window) {
    // Check if supported
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Optionally unobserve after reveal to save resources
            // observer.unobserve(entry.target);
          }
          // Optional: remove 'is-visible' if element scrolls out of view
          // else {
          //     entry.target.classList.remove('is-visible');
          // }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    )

    revealElements.forEach((element) => {
      revealObserver.observe(element)
    })
  } else {
    // Fallback for older browsers: reveal all elements immediately
    revealElements.forEach((element) => {
      element.classList.add('is-visible')
      // You might want simpler fallback styles if IO isn't supported
      element.style.opacity = 1
      element.style.transform = 'none'
    })
  }

  // --- Parallax Effect for Decorations ---
  const decorations = document.querySelectorAll('.decoration, .organic-shape')
  if ('IntersectionObserver' in window && decorations.length > 0) {
    let parallaxTimeout
    window.addEventListener(
      'scroll',
      () => {
        if (parallaxTimeout) {
          window.cancelAnimationFrame(parallaxTimeout)
        }
        parallaxTimeout = window.requestAnimationFrame(() => {
          const scrollY = window.pageYOffset
          decorations.forEach((decoration, index) => {
            if (!decoration) return
            // Vary speeds - give organic shapes slower speeds
            let speed = index % 3 === 0 ? -0.06 : index % 3 === 1 ? 0.03 : -0.04
            if (decoration.classList.contains('organic-shape')) {
              speed = index % 3 === 0 ? -0.02 : index % 3 === 1 ? 0.015 : -0.025 // Slower speeds for hero shapes
            }
            const yPos = scrollY * speed
            let initialTransform = decoration.style.transform
              .replace(/translateY\([^)]+\)/g, '')
              .trim()
            if (!initialTransform) {
              initialTransform = window.getComputedStyle(decoration).transform
              if (initialTransform === 'none') initialTransform = ''
              initialTransform = initialTransform
                .replace(/matrix.*\(/, '')
                .replace(')', '')
            }
            const currentTransform = initialTransform
              .replace(/translateY\([^)]+\)/g, '')
              .trim()
            decoration.style.transform = `${currentTransform} translateY(${yPos}px)`
          })
        })
      },
      { passive: true }
    )
  }

  // --- Update Copyright Year ---
  const yearSpan = document.getElementById('current-year')
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear()
  }
}) // End DOMContentLoaded
