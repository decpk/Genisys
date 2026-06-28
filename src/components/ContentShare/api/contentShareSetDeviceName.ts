/** Rename this device as shown in other devices' pickers. Returns the name. */
export async function contentShareSetDeviceName(name: string): Promise<string> {
  const res = await window.api.contentShareSetDeviceName(name)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to set device name')
  }
  return res.data ?? name
}
