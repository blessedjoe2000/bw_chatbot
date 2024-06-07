"use client";

import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessage = { content: query, role: "user" };

    setMessages((prev) => [...prev, newMessage]);
    setQuery("");

    setIsLoading(true);

    try {
      const response = await axios.post("/api/assistant", { newMessage });
      setMessages((prev) => [...prev, { content: response.data, role: "AI" }]);
    } catch (error) {
      console.log("An error occured ", error);
    }
    setIsLoading(false);
  };

  const quickPrompt = async (e) => {
    const query = e.target.innerHTML;

    const newMessage = { content: query, role: "user" };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/assistant", { newMessage });
      setMessages((prev) => [...prev, { content: response.data, role: "AI" }]);
      setIsLoading(false);
    } catch (error) {
      console.log("An error occured ", error);
    }
  };

  return (
    <div className="flex flex-col gap-2 justify-center items-center h-lvh px-10">
      <div className=" flex  ">
        <button
          onClick={quickPrompt}
          className="p-5 bg-blue-500 rounded-md mr-5"
        >
          What is social responsibility?
        </button>
        <button
          onClick={quickPrompt}
          className="p-5 bg-blue-500 rounded-md mr-5"
        >
          What if i can&apos;t afford A rating?
        </button>
        <button onClick={quickPrompt} className="p-5 bg-blue-500 rounded-md">
          How beneficial is sustainability?
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          placeholder="Type here... Ask about socially responsible questions "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-black"
        />
        <button
          disabled={isLoading || query === ""}
          className={
            isLoading || query === ""
              ? "rounded-lg px-2 py-1 ml-2 cursor-not-allowed bg-slate-500"
              : "rounded-lg px-2 py-1 ml-2 bg-blue-500 "
          }
        >
          send
        </button>
      </form>

      <div className="text-white flex flex-col gap-1">
        {messages &&
          messages.map((message, index) =>
            message.role === "user" ? (
              <p className="p-2 bg-blue-500 text-right" key={index}>
                {message.content}
              </p>
            ) : (
              <p className="p-2 bg-green-500" key={index}>
                {message.content}
              </p>
            )
          )}
        {isLoading && <div>Please wait...</div>}
      </div>
    </div>
  );
}
