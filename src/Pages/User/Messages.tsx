  import React from 'react';
  import ChatPage from '../../Components/Layout/Messages/ChatUI';

  const Messages: React.FC = () => {
    return (
      <div className="messages-container">
        <ChatPage />
      </div>
    );
  };

  export default Messages;