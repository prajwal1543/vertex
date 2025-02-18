import React, { useState } from "react";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            const response = await fetch("http://35.198.209.179:8080/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();
            const botMessage = { sender: "bot", text: data.generated_text };

            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "bot", text: "⚠️ Error: Unable to fetch response" },
            ]);
        }

        setInput("");
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
            <h2>ChatGPT Clone</h2>
            <div style={{ height: "400px", overflowY: "scroll", border: "1px solid gray", padding: "10px" }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "5px" }}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ width: "80%", padding: "10px" }}
            />
            <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "10px" }}>Send</button>
        </div>
    );
}

export default App;
