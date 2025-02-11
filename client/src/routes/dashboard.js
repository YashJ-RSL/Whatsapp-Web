import AsideInbox from "../components/aside-inbox";
import MainChat from "../components/main-chat";
import { useState, useEffect } from "react";
import { getAllConversations } from "../hooks/useFetch";
import useCreateInbox from "../hooks/useCreateInbox";
import { io } from "socket.io-client";

const Dashboard = () => {
  const metadata = JSON.parse(localStorage.getItem("metadata"));
  const userId = metadata.userId;
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(true);
  getAllConversations(userId, setConversations, setLoading);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      query: { userId, fullName: metadata.fullName },
    });
    setSocket(newSocket);
    return () => {
      // Clean up the socket when the component unmounts
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket?.emit("addUser", userId);
    socket?.on("getMessage", (data) => {
      //add into conversationWithUserDetails
      const newConversations = {
        //date in right format
        date: new Date().toISOString(),
        otherUserId: data.senderId,
        otherUserName: data.fullName,
        otherUserProfilePicture: "",
        reciepientId: data.reciepientId,
        senderId: data.senderId,
        text: data.text,
      };
      setConversations((prev) => {
        return {
          ...prev,
          conversationsWithUserDetails: [
            ...prev.conversationsWithUserDetails,
            newConversations,
          ],
        };
      });
    });
  }, [socket]);

  if (loading) return null;
  const { inbox, conversationHistory, conversedWith } = useCreateInbox(
    conversations.conversationsWithUserDetails
  );
  return (
    <div className="layout-grid">
      <AsideInbox
        setSelectedConversation={setSelectedConversation}
        inbox={inbox}
        conversedWith={conversedWith}
        metadata={metadata}
        setConversations={setConversations}
      />
      <MainChat
        selectedConversation={selectedConversation}
        conversationHistory={conversationHistory[selectedConversation]}
        userId={userId}
        socket={socket}
        setConversations={setConversations}
      />
    </div>
  );
};

export default Dashboard;
