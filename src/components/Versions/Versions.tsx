import { useState } from 'react'

export function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="absolute bottom-8 mx-auto inline-flex items-center overflow-hidden rounded-full bg-[#202127] px-0 py-4 backdrop-blur-xl">
      <li className="border-r border-muted-foreground/30 px-5 text-sm opacity-80">
        Electron v{versions.electron}
      </li>
      <li className="border-r border-muted-foreground/30 px-5 text-sm opacity-80">
        Chromium v{versions.chrome}
      </li>
      <li className="px-5 text-sm opacity-80">Node v{versions.node}</li>
    </ul>
  );
}
