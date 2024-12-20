'use client'
import { ChatMessageProps, useSocket } from "@/contexts/socket-context";
import { useEffect, useRef, useState } from "react";

export function Chat() {
  const [messageInput, setMessageInput] = useState<string>("");
  const [userNameInput, setUserNameInput] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const { chatMessages, isConnected } = useSocket()

  const sendApiSocketChat = async (
    chatMessage: ChatMessageProps
  ): Promise<Response> => {
    return await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatMessage),
    });
  };

  const sendMessage = async () => {
    if (messageInput) {
      const chatMessage: ChatMessageProps = {
        userName,
        message: messageInput,
      };

      const resp = await sendApiSocketChat(chatMessage);

      if (resp.ok) setMessageInput("");
    }

    inputRef.current!.focus();
  };

  const sendEnterRoomMessage = async () => {
    try {
      const chatMessage: ChatMessageProps = {
        userName: "Bot",
        message: `${userName} enter to chat rooom`,
      };
  
      const resp = await sendApiSocketChat(chatMessage);
      if (!resp.ok) {
        setTimeout(() => {
          sendEnterRoomMessage();
        }, 500);
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    if (userName) {
      sendEnterRoomMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  if (!isConnected) {
    return (
      <div className="flex items-center p-4 mx-auto min-h-screen justify-center">
        <div className="gap-4 flex flex-col items-center justify-center w-full h-full">
         ...loading
        </div>
      </div>
    );
  }

  if (!userName) {
    return (
      <div className="flex items-center p-4 mx-auto min-h-screen justify-center">
        <div className="gap-4 flex flex-col items-center justify-center w-full h-full">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 h-20">
            <div className="flex flex-row flex-1 h-full divide-gray-200 dark:divide-gray-800 divide-x">
              <div className="pr-2 flex-1">
                <input
                  type="text"
                  value={userNameInput}
                  placeholder={isConnected ? "Your Name" : "Connecting..."}
                  className="w-full h-full rounded shadow border border-gray-600 dark:border-gray-400 px-2 text-black dark:text-white"
                  disabled={!isConnected}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setUserName(userNameInput);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center items-stretch pl-2">
                <button
                  className="bg-slate-200 dark:bg-slate-800 rounded shadow text-sm text-black dark:text-white h-full px-2"
                  onClick={() => {
                    setUserName(userNameInput);
                  }}
                  disabled={!isConnected}
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="py-4 text-black dark:text-white  bg-slate-300 dark:bg-slate-950 sticky top-0">
        <h1 className="text-center text-2xl font-semibold">
          Realtime Chat App
        </h1>
        <h2 className="mt-2 text-center">in Next.js and Socket.io</h2>
      </div>
      <div className="flex flex-col flex-1 bg-slate-100 dark:bg-slate-900">
        <div className="flex-1 p-4 font-mono">
          {chatMessages.length ? (
            chatMessages.map((chatMessage, i) => (
              <div key={"msg_" + i} className="mt-1 text-black dark:text-white">
                <span
                  className={
                    chatMessage.userName === userName
                      ? `text-red-500`
                      : `text-slate-800 dark:text-slate-200`
                  }
                >
                  {chatMessage.userName === userName
                    ? "[Me]"
                    : `[${chatMessage.userName}]`}
                </span>
                : {chatMessage.message}
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-gray-600 dark:text-gray-400 py-6">
              No chat messages
            </div>
          )}
        </div>
        <div className="bg-slate-300 dark:bg-slate-950 p-4 h-20 sticky bottom-0">
          <div className="flex flex-row flex-1 h-full divide-gray-200 dark:divide-gray-800 divide-x">
            <div className="pr-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                className="w-full h-full rounded shadow border px-2 border-gray-600 dark:border-gray-400 text-black dark:text-white"
                disabled={!isConnected}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-stretch pl-2">
              <button
                className="bg-slate-50 dark:bg-slate-950 rounded shadow text-sm text-black dark:text-white h-full px-2"
                onClick={() => {
                  sendMessage();
                }}
                disabled={!isConnected}
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}