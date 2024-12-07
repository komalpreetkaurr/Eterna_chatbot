import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import image from "../assests/rob.png";
import data from '../data.json';  // Adjust the path according to your file structure

function Chatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  
  
   

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
