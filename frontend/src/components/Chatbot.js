import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import image from "../assests/rob.png";
import data from '../data.json';  // Adjust the path according to your file structure

function Chatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  // Function to scroll the chat to the bottom after a new message
  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Initializing chat with some starter messages
    const initialMessages = [
      { bot: "🤖 Hey there! Welcome to Eternal University! I'm here to help you navigate your journey. Need info or have questions? Just ask away! 🎓✨" },
      {
        bot: "Choose one of the options below to get started:",
        buttons: [
          "Admissions",
          "Colleges",
          "Fees",
          "Scholarships",
          "Courses",
          "Careers",
          "Campus Facilities",
          "Administration",
          "Contact Us",
          "Location",
          "FAQs",
        ],
      },
      {
        bot: "Hope these suggestions help! If there's anything more you need or if you have any other questions, just let me know. I'm here to assist you!",
      },
    ];
    setChatHistory(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleInputChange = (e) => setUserInput(e.target.value);

  const handleSendMessage = async () => {
    if (!userInput) return;

    // Add user message to chat history
    setChatHistory([...chatHistory, { user: userInput }]);
    setLoading(true);

    try {
      // Send user input to server and get response
      const response = await axios.post("http://localhost:5000/ask", {
        question: userInput,
      });
      const botAnswer = { bot: response.data.answer };

      // Include link if available
      if (response.data.link) {
        botAnswer.link = response.data.link;
      }

      // Add bot response to chat history
      setChatHistory([...chatHistory, { user: userInput }, botAnswer]);
    } catch (error) {
      console.error("Error getting response from the chatbot", error);
      setChatHistory([
        ...chatHistory,
        {
          bot: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    let followUpMessages = [];

    // Check if the selected category exists in the data and has follow-up options
    if (data[reply]) {
        const subcategories = Object.keys(data[reply]).filter(key => key !== "follow_up");

        if (data[reply].follow_up) {
            followUpMessages = [
                { bot: `You selected: ${reply}. Here are the options:` },
                { buttons: subcategories } // Show follow-up options (subcategories)
            ];
        } else {
            const { info, url } = data[reply];

            followUpMessages = [
                { bot: info || "No additional information available." },
                url && {
                    buttons: [
                        {
                            label: 'Learn More',
                            url: url
                        }
                    ]
                }
            ].filter(Boolean); // Remove undefined if there's no URL
        }
    } else {
        let foundInfo = null;
        let foundUrl = null;

        for (const category in data) {
            if (data[category][reply]) {
                foundInfo = data[category][reply].info || "No additional information available.";
                foundUrl = data[category][reply].url || null; // Allow for null URL
                break;
            }
        }

        if (foundInfo) {
            followUpMessages = [
                { bot: foundInfo },
                foundUrl && {
                    buttons: [
                        {
                            label: 'Learn More',
                            url: foundUrl
                        }
                    ]
                }
            ].filter(Boolean); // Show the button if URL is present (regardless of validity)
        } else {
            followUpMessages = [
                { bot: `I'm sorry, I couldn't find information for "${reply}".` }
            ];
        }
    }

    setChatHistory([...chatHistory, { user: reply }, ...followUpMessages]);
};


  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={image} alt="Bot Avatar" className="bot-avatar" />
        <h1>Eternal University</h1>
      </div>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.user ? "user-message" : "bot-message"}`}
          >
            <p>{chat.user || chat.bot}</p>

            {/* Add link button if available */}
            {chat.link && (
              <a
                href={chat.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
              >
                Learn More
              </a>
            )}

            {/* Render quick reply buttons if available */}
            {chat.buttons && (
              <div className="quick-replies">
                {chat.buttons.map((button, idx) => {
                  if (button && typeof button === 'object' && button.label && button.url) {
                    // If it's an object with a label and url, render it as a link
                    return (
                      <a
                        key={idx}
                        href={button.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="quick-reply-button"
                      >
                        {button.label}
                      </a>
                    );
                  }

                  // If it's just a string, render as a regular button
                  return (
                    <button
                      key={idx}
                      className="quick-reply-button"
                      onClick={() => handleQuickReply(button)}
                    >
                      {button}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="bot-message typing-indicator">
            <p>🤖 Typing...</p>
          </div>
        )}
      </div>

      {/* Input section */}
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="input-field"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="send-button"
        >
          <span>Send</span>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
