import { MediaDeviceProvider } from "@/contexts/media-devices-context";
import { SocketContextProvider } from "@/contexts/socket-context";
import { ReactNode } from "react";

export default function MeetingRoot({ children }: { children: ReactNode }) {
  return (
    <SocketContextProvider>
      <MediaDeviceProvider>
        {children}
      </MediaDeviceProvider>
    </SocketContextProvider>
  )
}