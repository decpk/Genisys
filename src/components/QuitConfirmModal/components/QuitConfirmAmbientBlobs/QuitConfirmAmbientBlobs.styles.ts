export const quitConfirmAmbientBlobsStyles = {
  root: 'fixed inset-0 z-[10000] overflow-hidden pointer-events-none',
  blobTop:
    'absolute top-[18%] left-[20%] w-[28rem] h-[28rem] bg-destructive/20 rounded-full blur-3xl mix-blend-screen animate-quit-blob-a',
  blobBottom:
    'absolute bottom-[15%] right-[18%] w-[26rem] h-[26rem] bg-primary/15 rounded-full blur-3xl mix-blend-screen animate-quit-blob-b',
  blobCenter:
    'absolute top-1/2 left-1/2 w-[34rem] h-[34rem] bg-destructive/10 rounded-full blur-[120px] mix-blend-screen animate-quit-blob-c',
} as const
