export interface AppModelSettingProps {
  /** Panel/app identifier used to read & write the per-app model override. */
  appId: string
  /** Setting row label. */
  label: string
  /** Optional setting row description. */
  description?: string
  /**
   * Optional model id used as the "Use default" fallback instead of the global
   * `chatModel`. Useful for features (e.g. vision) whose default must be a
   * specific capable model rather than the global default.
   */
  defaultModelId?: string
}
