import { MediaDeviceProvider } from "@/contexts/media-devices-context";
import { ReactNode } from "react";

export default function MeetingRoot({ children }: { children: ReactNode }) {
  return (
    <MediaDeviceProvider>
      {children}
    </MediaDeviceProvider>
  )
}