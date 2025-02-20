import React, { useState } from "react";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { sender: "user", text: input }]);

        try {
            // FIX 1: Changed 'prompt' to 'input' and 'userInput' to 'input'
            const response = await fetch("http://35.233.218.55:8080/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: input }), // Changed from {prompt: userInput}
            });

            if (!response.ok) throw new Error("API request failed");
            
            // FIX 2: Changed 'generated_text' to 'response'
            const data = await response.json();
            setMessages(prev => [...prev, { 
                sender: "bot", 
                text: data.response || "No response" 
            }]);

        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { 
                sender: "bot", 
                text: "⚠️ Error: " + error.message 
            }]);
        }

        setInput("");
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
            <h2>ChatGPT Clone</h2>
            <div style={{ 
                height: "400px", 
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                overflowY: "auto"
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ 
                        margin: "8px 0",
                        textAlign: msg.sender === "user" ? "right" : "left"
                    }}>
                        <div style={{
                            display: "inline-block",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            background: msg.sender === "user" ? "#e3f2fd" : "#f5f5f5",
                            maxWidth: "80%"
                        }}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ 
                        flex: 1,
                        padding: "10px",
                        borderRadius: "20px",
                        border: "1px solid #ccc",
                        marginRight: "8px"
                    }}
                    placeholder="Type your message..."
                />
                <button 
                    onClick={sendMessage}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "20px",
                        border: "none",
                        background: "#1976d2",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default App;