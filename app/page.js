"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";

const PROMPTS = [
  "What are some good productivity tips?",
  "Explain how the internet works in simple terms",
  "What are healthy habits to build daily?",
  "Give me a quick dinner recipe idea",
  "How can I improve my communication skills?",
  "What are some ways to make money online?",
  "What are simple ways to reduce stress?",
  "How do I stay consistent with my goals?",
  "What are some easy skills I can learn online?",
  "Explain how artificial intelligence works in simple terms",
];

const getRandomPrompts = () => {
  return [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 4);
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState([]);

  // Load 4 random prompts on first render
  useEffect(() => {
    setQuickPrompts(getRandomPrompts());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    const newMessage = { content: query, role: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/assistant`, {
        newMessage,
      });

      console.log("response from assistant ", response.data);
      const aiResponse = response.data.message;

      setMessages((prev) => [...prev, { content: aiResponse, role: "AI" }]);
    } catch (error) {
      console.error("An error occured, FULL ERROR:", error?.response || error);

      setMessages((prev) => [
        ...prev,
        {
          content: "Failed to get response. Please try again.",
          role: "AI",
        },
      ]);
    }

    setIsLoading(false);
  };

  const quickPrompt = async (text) => {
    const newMessage = { content: text, role: "user" };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/assistant`, {
        newMessage,
      });

      console.log("response from assistant ", response.data);

      const aiResponse = response.data.message;

      setMessages((prev) => [...prev, { content: aiResponse, role: "AI" }]);
    } catch (error) {
      console.error("An error occured, FULL ERROR:", error?.response || error);

      setMessages((prev) => [
        ...prev,
        {
          content: "Failed to get response. Please try again.",
          role: "AI",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="p-4 bg-white shadow text-center">
        <div className="font-semibold text-lg">AI Assistant</div>
        <p className="text-sm text-gray-500 mt-1">
          Ask any question you have in mind — I’m here to help you explore,
          learn, and solve problems.
        </p>
      </div>

      {/* QUICK PROMPTS */}
      <div className="flex flex-wrap gap-2 p-3 justify-center bg-gray-50">
        {quickPrompts.map((text, i) => (
          <button
            key={i}
            onClick={() => quickPrompt(text)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            {text}
          </button>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-[60%] text-sm sm:text-base shadow
                ${
                  isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <div className="prose prose-sm sm:prose-base max-w-none leading-relaxed">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-center py-4">
            <HashLoader size={40} color="#3b82f6" />
          </div>
        )}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t flex gap-2"
      >
        <input
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          disabled={isLoading || query === ""}
          className={`px-4 py-2 rounded-full text-white transition
            ${
              isLoading || query === ""
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
