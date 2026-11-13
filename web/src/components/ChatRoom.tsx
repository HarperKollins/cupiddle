import React, { useState, useEffect, useRef } from 'react';
import { Send, Gamepad2, Compass, CheckCheck, MapPin, ArrowLeft } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Conversation, Message, CoopGame } from '../types';
import { api } from '../api';

interface ChatRoomProps {
  conversations: Conversation[];
  selectedConvId: string | null;
  onSelectConversation: (id: string | null) => void;
  currentUserId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversations,
  selectedConvId,
  onSelectConversation,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [activeGame, setActiveGame] = useState<CoopGame | null>(null);
  const [gameAnswerInput, setGameAnswerInput] = useState('');
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [radarData, setRadarData] = useState<{ shared_interests: string[]; shared_tags: string[]; suggestions: string[] } | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const convList = conversations || [];
  const selectedConv = convList.find((c) => c.id === selectedConvId);

  // Load conversation details, messages, and radar
  useEffect(() => {
    if (!selectedConvId) return;

    api.getMessages(selectedConvId).then((res) => {
      setMessages(res?.messages || []);
    }).catch(console.error);

    api.getActiveCoopGame(selectedConvId).then((res) => {
      setActiveGame(res?.active_game || null);
    }).catch(console.error);

    api.getConversationRadar(selectedConvId).then((res) => {
      setRadarData(res || null);
    }).catch(console.error);
  }, [selectedConvId]);

  // Real-time WebSocket event listener
  useEffect(() => {
    const unsub = api.onWebSocketEvent((event) => {
      if (event.type === 'new_message' && event.payload.conversation_id === selectedConvId) {
        setMessages((prev) => [...prev, event.payload]);
      }
      if (event.type === 'coop_turn' && event.payload.conversation_id === selectedConvId) {
        setActiveGame(event.payload);
      }
    });
    return unsub;
  }, [selectedConvId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !inputContent.trim()) return;

    try {
      const newMsg = await api.sendMessage(selectedConvId, inputContent.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputContent('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleStartGame = async (gameType: string) => {
    if (!selectedConvId) return;
    try {
      setShowGameMenu(false);
      const game = await api.startCoopGame(selectedConvId, gameType);
      setActiveGame(game);
    } catch (err) {
      console.error('Failed to start game', err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeGame || !gameAnswerInput.trim()) return;
    try {
      const updated = await api.submitCoopAnswer(activeGame.id, gameAnswerInput.trim());
      setActiveGame(updated);
      setGameAnswerInput('');
    } catch (err) {
      console.error('Failed to submit game answer', err);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await api.addReaction(messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const rx = { ...(m.reactions || {}) };
            if (rx[currentUserId] === emoji) {
              delete rx[currentUserId];
            } else {
              rx[currentUserId] = emoji;
            }
            return { ...m, reactions: rx };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Reaction failed', err);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        height: isMobile ? 'calc(100vh - 125px)' : 'calc(100vh - 130px)',
        display: isMobile ? 'flex' : 'grid',
        flexDirection: 'column',
        gridTemplateColumns: isMobile ? undefined : '320px 1fr',
        backgroundColor: 'var(--color-paper-white, #ffffff)',
        borderRadius: isMobile ? '16px' : 'var(--radius-cards, 24px)',
        border: '1.5px solid var(--color-bumble-ink, #202020)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
      }}
    >
      {/* Left Column: Conversations List (Hidden on mobile if a conversation is open) */}
      {(!isMobile || !selectedConvId) && (
        <div
          style={{
            borderRight: isMobile ? 'none' : '1.5px solid var(--color-bumble-ink, #202020)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--color-paper-white, #ffffff)',
          }}
        >
        <div
          style={{
            padding: '20px',
            borderBottom: '1.5px solid var(--color-bumble-ink, #202020)',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              letterSpacing: '-0.01em',
            }}
          >
            Curious Connections
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--color-graphite, #575656)' }}>
            Active sparks & matches
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convList.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--color-graphite, #575656)', fontSize: '14px', lineHeight: 1.5 }}>
              No matches yet. Spark interesting perspectives in the Idea Stream!
            </div>
          ) : (
            convList.map((conv) => {
              const partner = conv.partner;
              const photo = partner?.photos && partner.photos.length > 0
                ? partner.photos[0].url
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
              const isSelected = conv.id === selectedConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-bumble-honey, #ffdb5b)' : 'transparent',
                    borderLeft: isSelected ? '5px solid var(--color-bumble-ink, #202020)' : '5px solid transparent',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.15s ease',
                  }}
                >
                <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                  <img
                    src={photo}
                    alt={partner?.display_name || 'Match'}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--color-bumble-ink, #202020)',
                    }}
                  />
                  {/* Active Online Indicator */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      border: '2px solid #ffffff',
                      borderRadius: '50%',
                      boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
                    }}
                    title="Active Now"
                  />
                </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '15px',
                          color: 'var(--color-bumble-ink, #202020)',
                        }}
                      >
                        {partner?.display_name || 'Curious Mind'}
                      </span>
                      {conv.unread_count > 0 && (
                        <span
                          style={{
                            backgroundColor: 'var(--color-bumble-ink, #202020)',
                            color: 'var(--color-bumble-honey, #ffdb5b)',
                            borderRadius: 'var(--radius-badges, 1000px)',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                          }}
                        >
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: isSelected ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '3px',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {conv.last_message?.content || 'Conversation sparked!'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Right Column: Active Conversation (Shown if desktop, or if mobile and selectedConvId is active) */}
      {(!isMobile || selectedConvId) && selectedConv ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-paper-white, #ffffff)', flex: 1 }}>
          {/* Header */}
          <div
            style={{
              padding: isMobile ? '12px 16px' : '16px 24px',
              borderBottom: '1.5px solid var(--color-bumble-ink, #202020)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
              {isMobile && (
                <button
                  onClick={() => onSelectConversation(null)}
                  title="Back to matches"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    marginRight: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-bumble-ink, #202020)',
                  }}
                >
                  <ArrowLeft size={22} />
                </button>
              )}
              <div style={{ position: 'relative', width: isMobile ? '42px' : '48px', height: isMobile ? '42px' : '48px', flexShrink: 0 }}>
                <img
                  src={selectedConv.partner?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedConv.partner?.display_name || 'Partner'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                  }}
                />
                {/* Active Green Light */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '11px',
                    height: '11px',
                    backgroundColor: '#10b981',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.85)',
                  }}
                  title="Active now"
                />
              </div>
              <div>
                <h4
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 800,
                    color: 'var(--color-bumble-ink, #202020)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {selectedConv.partner?.display_name}, {selectedConv.partner?.age}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '2px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: '#059669',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        display: 'inline-block',
                        boxShadow: '0 0 6px #10b981',
                      }}
                    />
                    <span>Active now</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--color-graphite, #575656)',
                      fontWeight: 600,
                    }}
                  >
                    <MapPin size={13} color="var(--color-bumble-ink, #202020)" />
                    <span>{selectedConv.partner?.city ? `${selectedConv.partner.city}, Nigeria` : 'Nigeria'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Co-op Corner Launcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                className="pill-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <Gamepad2 size={16} />
                <span>Co-op Corner</span>
              </button>

              {showGameMenu && (
                <div
                  className="animate-modal-spring"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '260px',
                    backgroundColor: 'var(--color-paper-white, #ffffff)',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    boxShadow: '0 12px 32px rgba(32, 32, 32, 0.16)',
                    padding: '8px',
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--color-graphite, #575656)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Play Together Asynchronously
                  </div>
                  {[
                    { type: 'logic_riddle', label: '🧩 Two-Player Logic Riddle' },
                    { type: 'would_you_rather', label: '⚖️ Would You Rather?' },
                    { type: 'two_truths_lie', label: '🎭 Two Truths and a Lie' },
                    { type: 'ai_or_human', label: '🤖 AI or Human Prose' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleStartGame(item.type)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        color: 'var(--color-bumble-ink, #202020)',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'block',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-mist, #f3f3f3)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Spark Origin Context Banner */}
          {selectedConv.origin_spark && (
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-pollen, #fff386)',
                borderBottom: '1px solid var(--color-bumble-ink, #202020)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-bumble-ink, #202020)',
                fontWeight: 600,
              }}
            >
              <CupiddleIcon size={16} color="var(--color-bumble-ink, #202020)" />
              <span>
                <strong>Conversation Spark:</strong> "{selectedConv.origin_spark.comment}" (re: {selectedConv.origin_spark.target_content.slice(0, 60)}...)
              </span>
            </div>
          )}

          {/* RabbitHole Radar Topic Suggestion */}
          {radarData && radarData.suggestions && radarData.suggestions.length > 0 && (
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-mist, #f3f3f3)',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            >
              <Compass size={15} color="var(--color-bumble-ink, #202020)" />
              <span>
                <strong>Radar Topic:</strong> {radarData.suggestions[0]}
              </span>
            </div>
          )}

          {/* Co-op Corner Active Game Box */}
          {activeGame && activeGame.status === 'in_progress' && (
            <div
              style={{
                margin: '14px 20px',
                padding: '18px 20px',
                backgroundColor: 'var(--color-pollen, #fff386)',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🎮 Co-op Corner: {activeGame.title}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-graphite, #575656)' }}>
                  {activeGame.user1_answer && activeGame.user2_answer ? 'Completed!' : 'Turn in progress'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-bumble-ink, #202020)', marginBottom: '14px', lineHeight: 1.5, fontWeight: 600 }}>
                {(() => {
                  try {
                    const data = JSON.parse(activeGame.prompt_data);
                    return data.riddle || data.option_a ? `${data.option_a} OR ${data.option_b}` : data.instruction || activeGame.prompt_data;
                  } catch {
                    return activeGame.prompt_data;
                  }
                })()}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Your answer or reasoning..."
                  value={gameAnswerInput}
                  onChange={(e) => setGameAnswerInput(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    backgroundColor: 'var(--color-paper-white, #ffffff)',
                  }}
                />
                <button
                  onClick={handleSubmitAnswer}
                  className="btn-bumble-action"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    backgroundColor: 'var(--color-bumble-ink, #202020)',
                    color: 'var(--color-paper-white, #ffffff)',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '72%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: isMine ? 'var(--color-bumble-ink, #202020)' : 'var(--color-mist, #f3f3f3)',
                      color: isMine ? '#ffffff' : 'var(--color-bumble-ink, #202020)',
                      fontSize: '15px',
                      lineHeight: 1.5,
                      border: isMine ? 'none' : '1.5px solid var(--color-bumble-ink, #202020)',
                      boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Message footer & reactions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      fontSize: '11px',
                      color: 'var(--color-graphite, #575656)',
                    }}
                  >
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <CheckCheck size={14} color="var(--color-bumble-ink, #202020)" />}

                    {/* Quick emoji reactions */}
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                      {['💡', '✨', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          style={{
                            fontSize: '12px',
                            padding: '3px 6px',
                            borderRadius: 'var(--radius-badges, 1000px)',
                            backgroundColor: msg.reactions?.[currentUserId] === emoji ? 'var(--color-bumble-honey, #ffdb5b)' : 'var(--color-mist, #f3f3f3)',
                            border: '1px solid #d0d0d0',
                            cursor: 'pointer',
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '16px 20px',
              borderTop: '1.5px solid var(--color-bumble-ink, #202020)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
            }}
          >
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Share a curious thought, question, or response..."
              style={{
                flex: 1,
                fontSize: '15px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
            <button
              type="submit"
              disabled={!inputContent.trim()}
              className="btn-bumble-action"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bumble-ink, #202020)',
                color: 'var(--color-paper-white, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputContent.trim() ? 1 : 0.5,
                cursor: inputContent.trim() ? 'pointer' : 'not-allowed',
                boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-graphite, #575656)', fontSize: '15px', padding: '40px' }}>
          Select a match from the left to start a curious conversation.
        </div>
      )}
    </div>
  );
};
