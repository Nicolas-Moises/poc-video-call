import { Chat } from "@/components/common/chat";
import { SetupConfig } from "@/components/pages/setup";

export default function SetupPage( ) {

  return (
    <div className="container py-4 min-h-screen">
      <SetupConfig />
      <Chat />
    </div>
  )
}