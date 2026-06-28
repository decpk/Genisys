import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

let permissionChecked = false
let permissionGranted = false

export async function checkNotificationPermission(): Promise<boolean> {
  if (permissionChecked) return permissionGranted
  try {
    permissionGranted = await isPermissionGranted()
    permissionChecked = true
    return permissionGranted
  } catch {
    return false
  }
}

export async function requestNotificationPermissionIfNeeded(): Promise<boolean> {
  const granted = await checkNotificationPermission()
  if (granted) return true

  try {
    const result = await requestPermission()
    permissionGranted = result === 'granted'
    permissionChecked = true
    return permissionGranted
  } catch {
    return false
  }
}

export async function sendOSNotification(title: string, body: string): Promise<boolean> {
  const granted = await requestNotificationPermissionIfNeeded()
  if (!granted) {
    console.warn('[OS Notification] Permission not granted')
    return false
  }

  try {
    sendNotification({ title, body })
    return true
  } catch (err) {
    console.warn('[OS Notification] Failed to send:', err)
    // Fallback: try Web Notification API (works in dev mode / browser)
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
        return true
      }
    } catch {
      // ignore
    }
    return false
  }
}
