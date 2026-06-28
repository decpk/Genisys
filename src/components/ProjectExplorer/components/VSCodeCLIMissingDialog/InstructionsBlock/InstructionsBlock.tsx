import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MacInstructions } from '../MacInstructions'
import { WindowsInstructions } from '../WindowsInstructions'
import { LinuxInstructions } from '../LinuxInstructions'

export function InstructionsBlock(): React.JSX.Element {
  return (
    <Tabs defaultValue="mac" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="mac" className="flex-1">macOS</TabsTrigger>
        <TabsTrigger value="windows" className="flex-1">Windows</TabsTrigger>
        <TabsTrigger value="linux" className="flex-1">Linux</TabsTrigger>
      </TabsList>
      <TabsContent value="mac">
        <MacInstructions />
      </TabsContent>
      <TabsContent value="windows">
        <WindowsInstructions />
      </TabsContent>
      <TabsContent value="linux">
        <LinuxInstructions />
      </TabsContent>
    </Tabs>
  )
}
