export async function fetchCustomPriceJson(url: string): Promise<unknown> {
  const res = await window.api.fetchCustomPriceJson(url)
  if (!res.success) throw new Error(res.error ?? 'Failed to fetch URL')
  return res.data
}
