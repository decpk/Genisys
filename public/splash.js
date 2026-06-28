/**
 * Genisys splash animation (pre-React).
 *
 * Lives in `public/` and is loaded as an external classic script because the
 * page CSP uses `script-src 'self'` (no inline JS allowed). It powers:
 *   1. A lightweight constellation/particle field on #splash-canvas.
 *   2. A rotating set of friendly status tips on #splash-tip.
 *
 * Everything self-terminates once React mounts and the splash is removed from
 * the DOM, so nothing leaks into the running app.
 */
;(function () {
  'use strict'

  var canvas = document.getElementById('splash-canvas')
  var tipEl = document.getElementById('splash-tip')
  if (!canvas) return

  var reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------------------------------------------------------------- tips -- */

  var TIPS = [
    'Warming up your workspace…',
    'Loading your apps…',
    'Wiring up the panels…',
    'Restoring your last session…',
    'Tuning the engine…',
    'Almost ready…',
  ]

  var tipTimer = null
  if (tipEl) {
    var tipIndex = 0
    tipEl.textContent = TIPS[0]
    if (!reduceMotion) {
      tipTimer = window.setInterval(function () {
        if (!tipEl.isConnected) {
          window.clearInterval(tipTimer)
          return
        }
        tipEl.style.opacity = '0'
        window.setTimeout(function () {
          if (!tipEl.isConnected) return
          tipIndex = (tipIndex + 1) % TIPS.length
          // Swap the text while fully transparent, then force WebKit/WKWebView
          // (Tauri's macOS engine) to drop the previous tip's composited layer
          // before fading the new text back in. Without disabling the
          // transition and forcing a synchronous reflow here, the outgoing
          // tip's GPU layer can linger while the incoming tip paints on top of
          // it — making two tips appear stacked on the splash screen.
          tipEl.style.transition = 'none'
          tipEl.textContent = TIPS[tipIndex]
          void tipEl.offsetWidth // flush: discard the stale layer, repaint clean
          tipEl.style.transition = ''
          void tipEl.offsetWidth // commit opacity:0 before re-enabling the fade
          tipEl.style.opacity = '1'
        }, 320)
      }, 2400)
    }
  }

  /* ------------------------------------------------------------- particles -- */

  var ctx = canvas.getContext('2d')
  if (!ctx) return

  /* ----------------------------------------------------------- theme sync -- */

  // React persists the active theme into localStorage (see
  // src/themes/themes.utils.ts → applyTheme). Read it here so the splash matches
  // the user's last-selected theme; fall back to dark defaults on first launch.
  var theme = {
    isDark: true,
    primary: 'hsl(245 58% 51%)',
    background: 'hsl(224 14% 14%)',
    foreground: 'rgba(255, 255, 255, 0.92)',
  }
  try {
    var savedRaw = window.localStorage.getItem('genisys-splash-theme')
    if (savedRaw) {
      var saved = JSON.parse(savedRaw)
      if (saved && typeof saved === 'object') {
        if (typeof saved.isDark === 'boolean') theme.isDark = saved.isDark
        if (saved.primary) theme.primary = saved.primary
        if (saved.background) theme.background = saved.background
        if (saved.foreground) theme.foreground = saved.foreground
      }
    }
  } catch (e) {
    /* localStorage unavailable — keep dark defaults */
  }

  // Build an hsl()/rgb() color string with a custom alpha for canvas strokes
  // and fills. Handles both "hsl(245 58% 51%)" and "rgb(99 102 241)" tokens.
  function withAlpha(color, a) {
    var inner = String(color)
      .replace(/hsla?\(|rgba?\(|\)/gi, '')
      .replace(/,/g, ' ')
      .trim()
    return (/%/.test(inner) ? 'hsl(' : 'rgb(') + inner + ' / ' + a + ')'
  }

  // Push the theme tokens onto the splash element so the CSS (background, logo
  // glow, text, progress bar) and this canvas share one source of truth.
  var splashEl = document.getElementById('splash')
  if (splashEl) {
    splashEl.style.setProperty('--splash-primary', theme.primary)
    splashEl.style.setProperty('--splash-bg', theme.background)
    splashEl.style.setProperty('--splash-fg', theme.foreground)
    splashEl.style.setProperty(
      '--splash-logo-filter',
      theme.isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
    )
  }
  // Match the page background to avoid a flash of the wrong color behind the splash.
  try {
    document.body.style.backgroundColor = theme.background
  } catch (e) {
    /* ignore */
  }

  var PRIMARY = theme.primary

  var width = 0
  var height = 0
  var dpr = Math.min(window.devicePixelRatio || 1, 2)
  var particles = []

  function resize() {
    width = canvas.clientWidth || window.innerWidth
    height = canvas.clientHeight || window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function makeParticles() {
    // Density scales with viewport area, gently clamped.
    var target = Math.round((width * height) / 22000)
    var count = Math.max(28, Math.min(70, target))
    particles = []
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.6,
      })
    }
  }

  var LINK_DIST = 130
  var LINK_DIST_SQ = LINK_DIST * LINK_DIST

  function draw() {
    ctx.clearRect(0, 0, width, height)

    // Connecting lines (drawn first so nodes sit on top).
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i]
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j]
        var dx = a.x - b.x
        var dy = a.y - b.y
        var distSq = dx * dx + dy * dy
        if (distSq < LINK_DIST_SQ) {
          var alpha = (1 - distSq / LINK_DIST_SQ) * 0.32
          ctx.strokeStyle = withAlpha(PRIMARY, alpha.toFixed(3))
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    // Nodes with a soft glow.
    var nodeFill = withAlpha(PRIMARY, 0.9)
    var nodeGlow = withAlpha(PRIMARY, 0.8)
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k]
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = nodeFill
      ctx.shadowColor = nodeGlow
      ctx.shadowBlur = 8
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }

  function step() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < -20) p.x = width + 20
      else if (p.x > width + 20) p.x = -20
      if (p.y < -20) p.y = height + 20
      else if (p.y > height + 20) p.y = -20
    }
    draw()
  }

  var rafId = null
  function loop() {
    // Stop cleanly once React replaces #root (splash removed from DOM).
    if (!canvas.isConnected) {
      stop()
      return
    }
    step()
    rafId = window.requestAnimationFrame(loop)
  }

  function stop() {
    if (rafId != null) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
    if (tipTimer != null) {
      window.clearInterval(tipTimer)
      tipTimer = null
    }
    window.removeEventListener('resize', onResize)
  }

  function onResize() {
    resize()
    makeParticles()
    if (reduceMotion) draw()
  }

  window.addEventListener('resize', onResize)

  resize()
  makeParticles()

  if (reduceMotion) {
    // Static frame, no motion.
    draw()
  } else {
    loop()
  }
})()
