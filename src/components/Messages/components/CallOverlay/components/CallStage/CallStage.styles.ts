export const callStageStyles = {
  root: 'relative flex h-full w-full items-center justify-center overflow-hidden',
  remoteVideo: 'h-full w-full max-h-full max-w-full object-contain',
  localVideo:
    'absolute bottom-4 right-4 h-32 w-44 rounded-lg border border-white/10 object-cover shadow-lg',
  audioStage: 'flex flex-col items-center gap-4',
  audioName: 'text-lg font-semibold text-white/90',
} as const
