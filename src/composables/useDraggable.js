export function useDraggable() {
  let target = null
  let startX = 0, startY = 0

  function onHeaderMouseDown(e) {
    const card = e.currentTarget.closest('.q-card')
    if (!card) return
    target = card
    const rect = target.getBoundingClientRect()
    startX = e.clientX - rect.left
    startY = e.clientY - rect.top
    target.style.position = 'fixed'
    target.style.left = rect.left + 'px'
    target.style.top = rect.top + 'px'
    target.style.margin = '0'
    target.style.zIndex = '9999'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    e.preventDefault()
  }

  function onMouseMove(e) {
    if (!target) return
    target.style.left = (e.clientX - startX) + 'px'
    target.style.top = (e.clientY - startY) + 'px'
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    target = null
  }

  function resetPosition() {
    if (target) {
      target.style.position = ''
      target.style.left = ''
      target.style.top = ''
      target.style.margin = ''
      target.style.zIndex = ''
    }
    target = null
  }

  return { onHeaderMouseDown, resetPosition }
}
