
import { NextApiResponseWithSocket } from "@/_types";
import { NextApiRequest } from "next";

const chat = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (req.method === "POST") {
    // get message
    const message = req.body;

    // dispatch to channel "message"
    res?.socket?.server?.io?.emit("message", message);

    // return message
    res.status(201).json(message);
  }
};

export default chat;