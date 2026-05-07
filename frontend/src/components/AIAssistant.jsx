import React, { useState } from 'react';
import { Bot, X, Send, MessageSquare } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Burbuja Flotante */}
      <button 
        className="ai-bubble"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,161,155,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'rotate(90deg) scale(0.9)' : 'rotate(0) scale(1)'
        }}
      >
        {isOpen ? <X size={30} /> : <Bot size={30} />}
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="ai-chat-window glass fade-in">
          <div className="ai-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="ai-avatar">
                <Bot size={20} color="white" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Nova AI</h4>
                <span style={{ fontSize: '0.7rem', color: '#00c4b6', fontWeight: '700' }}>En línea</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-messages">
            <div className="ai-msg bot">
              ¡Hola! Soy Nova, tu asistente virtual. ¿En qué puedo ayudarte hoy con tus medicamentos?
            </div>
          </div>

          <div className="ai-chat-input">
            <input 
              type="text" 
              placeholder="Escribe tu consulta..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setMessage('')}
            />
            <button className="btn-send">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ai-chat-window {
          position: fixed;
          bottom: 110px;
          right: 30px;
          width: 380px;
          height: 500px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.4);
        }

        .ai-chat-header {
          padding: 20px;
          background: white;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-avatar {
          width: 35px;
          height: 35px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ai-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: rgba(248, 250, 249, 0.5);
        }

        .ai-msg {
          padding: 12px 16px;
          border-radius: 15px;
          font-size: 0.9rem;
          max-width: 85%;
          line-height: 1.4;
        }

        .ai-msg.bot {
          background: white;
          color: var(--text-dark);
          align-self: flex-start;
          border-bottom-left-radius: 2px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .ai-chat-input {
          padding: 15px 20px;
          background: white;
          display: flex;
          gap: 10px;
          border-top: 1px solid #eee;
        }

        .ai-chat-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }

        .btn-send {
          background: var(--primary);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-send:hover { transform: scale(1.1); }

        @media (max-width: 768px) {
          .ai-chat-window {
            width: 90%;
            height: 70vh;
            right: 5%;
            bottom: 100px;
          }
          .ai-bubble {
            width: 55px;
            height: 55px;
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
