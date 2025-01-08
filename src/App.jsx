import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { RiRobot2Fill, RiSparklingFill } from 'react-icons/ri';
import { BsPersonCircle } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('Please set up your Gemini API key in the .env file');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = { 
        role: 'assistant', 
        content: data.candidates[0].content.parts[0].text 
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'An unexpected error occurred'}. Please check the console for more details.`
      }]);
    }

    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4">
              <div className="relative">
                <RiSparklingFill className="absolute -top-2 -right-2 text-purple-500 text-xl animate-pulse" />
                <RiRobot2Fill className="text-6xl text-purple-500" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text text-center">
                Quantum
              </h1>
              <p className="text-gray-400 text-center max-w-md">
                Your advanced AI companion powered by Gemini. Ask anything from coding questions to creative writing - I'm here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                <div className="bg-gray-800 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-400 font-semibold mb-2">Examples</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>"Explain quantum computing in simple terms"</li>
                    <li>"Write a Python function to sort a list"</li>
                    <li>"Help me debug this React component"</li>
                  </ul>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-400 font-semibold mb-2">Capabilities</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>Advanced code understanding</li>
                    <li>Clear technical explanations</li>
                    <li>Creative problem-solving</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex space-x-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'flex-row-reverse space-x-reverse'
                    : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <BsPersonCircle className="text-2xl text-pink-500" />
                  ) : (
                    <RiRobot2Fill className="text-2xl text-purple-500" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-gray-800 text-gray-100 border border-purple-500/20'
                  } shadow-lg`}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-2">
                <RiRobot2Fill className="text-2xl text-purple-500" />
                <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-purple-500/20">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-purple-500/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
          <button
            onClick={clearChat}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <FiTrash2 className="text-gray-300" />
            <span className="text-sm text-gray-300">Clear chat</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg bg-gray-700 border border-purple-500/20 px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Send</span>
              <FiSend />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;