import React, { useState, useEffect, useRef } from 'react';
import { Send, Gamepad2, Compass, CheckCheck, MapPin, ArrowLeft } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Conversation, Message, CoopGame } from '../types';
import { api } from '../api';
import { scanMessageSafety } from '../utils/safetyGuard';

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
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Client-side pre-send safety verification (Phone numbers, WhatsApp, transactional leaks)
    const safetyCheck = scanMessageSafety(inputContent.trim());
    if (safetyCheck.blocked) {
      setSafetyError(safetyCheck.reason || 'Safety Alert: Contact info and external redirects are strictly prohibited.');
      return;
    }

    try {
      setSafetyError(null);
      const newMsg = await api.sendMessage(selectedConvId, inputContent.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputContent('');
    } catch (err: any) {
      console.error('Failed to send message', err);
      setSafetyError(err.message || 'Safety Alert: Phone numbers, WhatsApp redirects, and off-app contacts are strictly prohibited.');
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
        width: '100%',
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#170E12',
        borderRadius: '24px',
        border: '1px solid rgba(255, 31, 106, 0.2)',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* View 1: Matches / Conversations List (Shown when no thread is selected) */}
      {!selectedConvId && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#140B10',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 31, 106, 0.12)',
                color: '#FF1F6A',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              <CupiddleIcon size={12} color="#FF1F6A" />
              Connected Desires
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                margin: '0 0 2px 0',
              }}
            >
              Conversations
            </h3>
            <span style={{ fontSize: '12px', color: '#8A7B82' }}>
              Active sparks and mutual campus matches
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convList.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#8A7B82', fontSize: '13px', lineHeight: 1.6 }}>
                <CupiddleIcon size={32} color="#FF1F6A" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <p style={{ margin: '0 0 6px 0', color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                  No Conversations Yet
                </p>
                Spark intriguing ideas in the Desire Stream to initiate a midnight connection.
              </div>
            ) : (
              convList.map((conv) => {
                const partner = conv.partner;
                const photo = partner?.photos && partner.photos.length > 0
                  ? partner.photos[0].url
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.15s ease',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 31, 106, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                      <img
                        src={photo}
                        alt={partner?.display_name || 'Match'}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid rgba(255, 31, 106, 0.3)',
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
                          border: '2px solid #170E12',
                          borderRadius: '50%',
                          boxShadow: '0 0 6px rgba(16, 185, 129, 0.85)',
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
                            color: '#FFFFFF',
                          }}
                        >
                          {partner?.display_name || 'Curious Mind'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span
                            style={{
                              backgroundColor: '#FF1F6A',
                              color: '#FFFFFF',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              boxShadow: '0 2px 8px rgba(255, 31, 106, 0.5)',
                            }}
                          >
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: '13px',
                          color: '#9E8C93',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '3px',
                          marginBottom: 0,
                        }}
                      >
                        {conv.last_message?.content || 'Spark connected! Say hello.'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View 2: Active Conversation Thread */}
      {selectedConvId && selectedConv && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#140B10',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => onSelectConversation(null)}
                title="Back to conversations"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF1F6A',
                }}
              >
                <ArrowLeft size={20} />
              </button>

              <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                <img
                  src={selectedConv.partner?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedConv.partner?.display_name || 'Partner'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(255, 31, 106, 0.4)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#10b981',
                    border: '2px solid #140B10',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #10b981',
                  }}
                  title="Active now"
                />
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedConv.partner?.display_name}, {selectedConv.partner?.age}
                  {selectedConv.partner?.username && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF1F6A', backgroundColor: 'rgba(255, 31, 106, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                      @{selectedConv.partner.username}
                    </span>
                  )}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                    Active now
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#8A7B82' }}>
                    <MapPin size={11} color="#FF1F6A" />
                    <span>{selectedConv.partner?.city ? `${selectedConv.partner.city}` : 'Nigeria'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Co-op Corner Launcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 31, 106, 0.15)',
                  border: '1px solid rgba(255, 31, 106, 0.35)',
                  color: '#FF1F6A',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Gamepad2 size={14} />
                <span>Co-op</span>
              </button>

              {showGameMenu && (
                <div
                  className="animate-modal-spring"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '240px',
                    backgroundColor: '#1E1116',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 31, 106, 0.3)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                    padding: '8px',
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#FF1F6A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Play Together
                  </div>
                  {[
                    { type: 'logic_riddle', label: '🧩 Logic Riddle' },
                    { type: 'would_you_rather', label: '⚖️ Would You Rather?' },
                    { type: 'two_truths_lie', label: '🎭 Two Truths & a Lie' },
                    { type: 'ai_or_human', label: '🤖 AI or Human Prose' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleStartGame(item.type)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'block',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 31, 106, 0.15)')}
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
                padding: '8px 16px',
                backgroundColor: 'rgba(94, 8, 30, 0.45)',
                borderBottom: '1px solid rgba(255, 31, 106, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#E0D4D8',
                fontWeight: 600,
              }}
            >
              <CupiddleIcon size={14} color="#FF1F6A" />
              <span>
                <strong style={{ color: '#FF1F6A' }}>Spark Origin:</strong> "{selectedConv.origin_spark.comment}"
              </span>
            </div>
          )}

          {/* Radar Topic Suggestion */}
          {radarData && radarData.suggestions && radarData.suggestions.length > 0 && (
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: '#1E1116',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#C7B6BC',
              }}
            >
              <Compass size={13} color="#FF1F6A" />
              <span>
                <strong style={{ color: '#FF1F6A' }}>Radar Topic:</strong> {radarData.suggestions[0]}
              </span>
            </div>
          )}

          {/* Co-op Corner Active Game Box */}
          {activeGame && activeGame.status === 'in_progress' && (
            <div
              style={{
                margin: '12px 16px',
                padding: '14px 16px',
                backgroundColor: '#1A0E14',
                borderRadius: '16px',
                border: '1px solid rgba(255, 31, 106, 0.3)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF1F6A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🎮 Co-op Corner: {activeGame.title}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#8A7B82' }}>
                  {activeGame.user1_answer && activeGame.user2_answer ? 'Completed!' : 'Turn in progress'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.45, fontWeight: 600 }}>
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
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#140B10',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSubmitAnswer}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            className="secure-student-app"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#0D080A',
            }}
          >
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine
                        ? 'linear-gradient(135deg, #5E081E 0%, #FF1F6A 100%)'
                        : '#1E1116',
                      color: '#ffffff',
                      fontSize: '14px',
                      lineHeight: 1.45,
                      border: isMine ? 'none' : '1px solid rgba(255, 31, 106, 0.2)',
                      boxShadow: isMine
                        ? '0 4px 14px rgba(255, 31, 106, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Message footer & reactions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px',
                      fontSize: '10px',
                      color: '#8A7B82',
                    }}
                  >
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <CheckCheck size={12} color="#FF1F6A" />}

                    {/* Quick emoji reactions */}
                    <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                      {['💡', '✨', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          style={{
                            fontSize: '11px',
                            padding: '2px 5px',
                            borderRadius: '9999px',
                            backgroundColor: msg.reactions?.[currentUserId] === emoji ? 'rgba(255, 31, 106, 0.25)' : '#1E1116',
                            border: msg.reactions?.[currentUserId] === emoji ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.08)',
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

          {/* Safety Error Alert */}
          {safetyError && (
            <div
              style={{
                margin: '8px 16px 0',
                padding: '10px 14px',
                backgroundColor: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                borderRadius: '12px',
                color: '#fda4af',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔒 {safetyError}</span>
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#140B10',
            }}
          >
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Share a curious thought or question..."
              style={{
                flex: 1,
                fontSize: '14px',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#ffffff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!inputContent.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputContent.trim() ? 1 : 0.5,
                cursor: inputContent.trim() ? 'pointer' : 'not-allowed',
                boxShadow: '0 0 14px rgba(255, 31, 106, 0.4)',
                border: 'none',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
