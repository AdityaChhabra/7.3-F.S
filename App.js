// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Connect to the backend server running on port 3001
const socket = io('http://localhost:3001');

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  // Ref to keep the chat scrolled to the bottom
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    // Socket.io connection and event listeners
    
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    // Listener for receiving messages from the server
    socket.on('receive_message', (data) => {
      // Add the new message to the state array
      setChatMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listener for user count updates
    socket.on('user_count_update', (count) => {
      setTotalUsers(count);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Cleanup function: remove listeners when the component unmounts
    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.off('user_count_update');
      socket.off('disconnect');
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.trim() && username.trim()) {
      const messageData = {
        user: username,
        message: message,
        time: new Date().toLocaleTimeString(),
      };
      
      // Emit the message to the server
      socket.emit('send_message', messageData);

      // Clear the input field
      setMessage('');
    }
  };

  const isUserSet = username.trim() !== '';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Real-Time Chat App 💬</h1>
        <p style={{ color: isConnected ? 'green' : 'red' }}>
          Status: {isConnected ? 'Online' : 'Offline'} | Users: {totalUsers}
        </p>
      </header>
      
      {!isUserSet && (
        <div style={styles.userSetup}>
          <input 
            type="text" 
            placeholder="Enter your name to join..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
      )}

      {isUserSet && (
        <div style={styles.chatBox}>
          <div style={styles.messagesContainer}>
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.message,
                  alignSelf: msg.user === username ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.user === username ? '#dcf8c6' : '#fff',
                }}
              >
                <span style={styles.messageUser}>{msg.user === username ? 'You' : msg.user}</span>
                <p style={styles.messageText}>{msg.message}</p>
                <span style={styles.messageTime}>{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </div>
          <form onSubmit={handleSendMessage} style={styles.inputArea}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.messageInput}
              disabled={!isConnected}
            />
            <button type="submit" style={styles.sendButton} disabled={!isConnected || !message.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Basic inline styles for a clean look
const styles = {
    container: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    userSetup: {
        textAlign: 'center',
        padding: '20px',
    },
    input: {
        padding: '10px',
        width: '80%',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    chatBox: {
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
        border: '1px solid #eee',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    messagesContainer: {
        flexGrow: 1,
        padding: '10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
    },
    message: {
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: '15px',
        marginBottom: '10px',
        wordWrap: 'break-word',
        boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)',
    },
    messageUser: {
        fontWeight: 'bold',
        fontSize: '0.8em',
        opacity: 0.7,
        display: 'block',
        marginBottom: '2px',
    },
    messageText: {
        margin: '0',
    },
    messageTime: {
        fontSize: '0.7em',
        display: 'block',
        textAlign: 'right',
        opacity: 0.6,
        marginTop: '2px',
    },
    inputArea: {
        display: 'flex',
        borderTop: '1px solid #eee',
        padding: '10px',
        backgroundColor: '#fff',
    },
    messageInput: {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ccc',
        marginRight: '10px',
    },
    sendButton: {
        padding: '10px 15px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer',
    }
};

export default App;