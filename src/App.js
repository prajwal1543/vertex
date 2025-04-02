import React, { useState, useEffect } from "react";

const removeHtmlTags = (text) => {
    return text.replace(/<.*?>/g, "").trim();
};

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    // 🎤 Configure voice recognition
    useEffect(() => {
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
    }, []);

    const startListening = () => {
        recognition.start();
    };

    // 📨 Send text message to Flask
    const sendMessage = async () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { sender: "user", text: input }]);

        try {
            const response = await fetch("http://34.53.11.165:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            if (!data.response) throw new Error("Invalid response from server");

            const cleanedResponse = removeHtmlTags(data.response);
            setMessages((prev) => [...prev, { sender: "bot", text: cleanedResponse }]);

            if (!isMuted) {
                speakResponse(cleanedResponse);
                downloadAudio();
            }

        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error: " + error.message }]);
        }

        setInput("");
    };

    // 🔊 Speak out response
    const speakResponse = (text) => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        window.speechSynthesis.speak(speech);
    };

    // 🔉 Download the voice response from backend
    const downloadAudio = async () => {
        const audioResponse = await fetch("http://34.53.11.165:5000/download_audio");
        const blob = await audioResponse.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    };

    // 🎵 Toggle Mute
    const toggleMute = () => {
        setIsMuted((prev) => !prev);
        window.speechSynthesis.cancel();
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
            <h2>Eira 0.1</h2>
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

            {/* 🎤 Input Section */}
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
                        cursor: "pointer",
                        marginRight: "8px"
                    }}
                >
                    Send
                </button>

                {/* 🎤 Start Voice Input */}
                <button 
                    onClick={startListening}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "20px",
                        border: "none",
                        background: isListening ? "#ff9800" : "#4caf50",
                        color: "white",
                        cursor: "pointer",
                        marginRight: "8px"
                    }}
                >
                    {isListening ? "Listening..." : "🎤 Speak"}
                </button>

                {/* 🔇 Mute/Unmute Button */}
                <button 
                    onClick={toggleMute}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "20px",
                        border: "none",
                        background: isMuted ? "#d32f2f" : "#4caf50",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    {isMuted ? "🔇 Muted" : "🔊 Unmute"}
                </button>
            </div>
        </div>
    );
}

export default App;
