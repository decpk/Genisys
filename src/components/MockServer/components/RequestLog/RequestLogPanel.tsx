import { RequestLog } from './RequestLog'

export function RequestLogPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <RequestLog />
    </div>
  )
}
