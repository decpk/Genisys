import { createElement } from 'react'
import { Mic, MicOff, Monitor, MonitorUp, PhoneOff, Video, VideoOff } from 'lucide-react'

import type {
  CallControlDescriptor,
  CallControlsBarData,
  CallControlsBarProps,
} from './CallControlsBar.types'

const ICON_CLASS = 'h-5 w-5'

export function useCallControlsBarData(props: CallControlsBarProps): CallControlsBarData {
  const { call, handlers } = props

  let MicIcon = MicOff
  if (call.micOn) MicIcon = Mic

  let ScreenIcon = Monitor
  if (call.sharingScreen) ScreenIcon = MonitorUp

  const controls: CallControlDescriptor[] = [
    {
      key: 'mic',
      icon: createElement(MicIcon, { className: ICON_CLASS }),
      active: call.micOn,
      onClick: handlers.toggleMic,
      label: 'Toggle microphone',
      variant: 'default',
    },
  ]

  if (call.kind === 'video') {
    let CamIcon = VideoOff
    if (call.camOn) CamIcon = Video
    controls.push({
      key: 'camera',
      icon: createElement(CamIcon, { className: ICON_CLASS }),
      active: call.camOn,
      onClick: handlers.toggleCamera,
      label: 'Toggle camera',
      variant: 'default',
    })
  }

  controls.push({
    key: 'screen',
    icon: createElement(ScreenIcon, { className: ICON_CLASS }),
    active: call.sharingScreen,
    onClick: handlers.toggleScreenShare,
    label: 'Toggle screen share',
    variant: 'default',
  })

  controls.push({
    key: 'end',
    icon: createElement(PhoneOff, { className: ICON_CLASS }),
    active: false,
    onClick: handlers.endCall,
    label: 'End call',
    variant: 'danger',
  })

  return { controls }
}
