import React from 'react';
import ChatPage from '../../Components/Layout/Messages/ChatUI';

const Messages: React.FC = () => {
  return (
    <div className="messages-container">
      <ChatPage theme={''} />
    </div>
  );
};

export default Messages;