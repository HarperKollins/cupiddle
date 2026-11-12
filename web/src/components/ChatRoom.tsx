import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Gamepad2, Compass, CheckCheck, MapPin } from 'lucide-react';
import { Conversation, Message, CoopGame } from '../types';
import { api } from '../api';

interface ChatRoomProps {
  conversations: Conversation[];
  selectedConvId: string | null;
  onSelectConv: (id: string) => void;
  currentUserId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversations,
  selectedConvId,
  onSelectConv,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [activeGame, setActiveGame] = useState<CoopGame | null>(null);
  const [gameAnswerInput, setGameAnswerInput] = useState('');
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [radarData, setRadarData] = useState<{ shared_interests: string[]; shared_tags: string[]; suggestions: string[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // Load conversation details, messages, and radar
  useEffect(() => {
    if (!selectedConvId) return;

    api.getMessages(selectedConvId).then((res) => {
      setMessages(res.messages);
    }).catch(console.error);

    api.getActiveCoopGame(selectedConvId).then((res) => {
      setActiveGame(res.active_game);
    }).catch(console.error);

    api.getConversationRadar(selectedConvId).then((res) => {
      setRadarData(res);
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
      // Locally update reactions
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
    <div style={{
      maxWidth: '1040px',
      margin: '0 auto',
      height: 'calc(100vh - 120px)',
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      backgroundColor: 'var(--color-surface-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-surface-border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Left Column: Conversations List */}
      <div style={{
        borderRight: '1px solid var(--color-surface-border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Connections</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Curious matches & active conversations
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No matches yet. Spark interesting people in the Idea Stream!
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = conv.partner;
              const photo = partner?.photos && partner.photos.length > 0
                ? partner.photos[0].url
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
              const isSelected = conv.id === selectedConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConv(conv.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--color-violet-500)' : '4px solid transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <img
                    src={photo}
                    alt={partner?.display_name || 'Match'}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                        {partner?.display_name || 'Curious Mind'}
                      </span>
                      {conv.unread_count > 0 && (
                        <span style={{
                          backgroundColor: 'var(--color-coral-500)',
                          color: '#ffffff',
                          borderRadius: '50%',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '3px',
                    }}>
                      {conv.last_message?.content || 'Conversation sparked!'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      {selectedConv ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(24, 16, 36, 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={selectedConv.partner?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                alt={selectedConv.partner?.display_name || 'Partner'}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  {selectedConv.partner?.display_name}, {selectedConv.partner?.age}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  <MapPin size={13} />
                  <span>{selectedConv.partner?.city || 'Nigeria'}</span>
                </div>
              </div>
            </div>

            {/* Co-op Corner Launcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  color: 'var(--color-lavender-100)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Gamepad2 size={16} color="var(--color-violet-400)" />
                <span>Co-op Corner</span>
              </button>

              {showGameMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '240px',
                  backgroundColor: 'var(--color-surface-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-surface-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  padding: '8px',
                  zIndex: 20,
                }}>
                  <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Choose Co-op Activity
                  </div>
                  <button
                    onClick={() => handleStartGame('logic_riddle')}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: '13px', display: 'block' }}
                  >
                    🧩 Two-Player Logic Riddle
                  </button>
                  <button
                    onClick={() => handleStartGame('would_you_rather')}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: '13px', display: 'block' }}
                  >
                    ⚖️ Would You Rather?
                  </button>
                  <button
                    onClick={() => handleStartGame('two_truths_lie')}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: '13px', display: 'block' }}
                  >
                    🎭 Two Truths and a Lie
                  </button>
                  <button
                    onClick={() => handleStartGame('ai_or_human')}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: '13px', display: 'block' }}
                  >
                    🤖 AI or Human Prose
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Spark Origin Context Banner */}
          {selectedConv.origin_spark && (
            <div style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(76, 29, 149, 0.25)',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--color-lavender-200)',
            }}>
              <Sparkles size={14} color="var(--color-coral-400)" />
              <span>
                <strong>Conversation Spark:</strong> "{selectedConv.origin_spark.comment}" (re: {selectedConv.origin_spark.target_content.slice(0, 60)}...)
              </span>
            </div>
          )}

          {/* RabbitHole Radar Topic Suggestion */}
          {radarData && radarData.suggestions.length > 0 && (
            <div style={{
              padding: '8px 20px',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              borderBottom: '1px solid rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--color-coral-300)',
            }}>
              <Compass size={14} />
              <span><strong>Radar Suggestion:</strong> {radarData.suggestions[0]}</span>
            </div>
          )}

          {/* Co-op Corner Active Game Card (if in progress) */}
          {activeGame && activeGame.status === 'in_progress' && (
            <div style={{
              margin: '12px 20px',
              padding: '16px',
              backgroundColor: 'rgba(34, 23, 51, 0.95)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-violet-500)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-violet-400)', textTransform: 'uppercase' }}>
                  🎮 Co-op Corner: {activeGame.title}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {activeGame.user1_answer && activeGame.user2_answer ? 'Done!' : 'Turn in progress'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#ffffff', marginBottom: '12px', lineHeight: 1.5 }}>
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
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button
                  onClick={handleSubmitAnswer}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-violet-600)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isMine ? 'var(--color-violet-700)' : 'var(--color-surface-input)',
                    color: '#ffffff',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    border: isMine ? 'none' : '1px solid var(--color-surface-border)',
                  }}>
                    {msg.content}
                  </div>

                  {/* Message footer & reactions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <CheckCheck size={13} color="var(--color-lavender-200)" />}

                    {/* Quick emoji reactions */}
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                      {['💡', '✨', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          style={{
                            fontSize: '11px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            backgroundColor: msg.reactions?.[currentUserId] === emoji ? 'var(--color-violet-800)' : 'transparent',
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
              borderTop: '1px solid var(--color-surface-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(24, 16, 36, 0.7)',
            }}
          >
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Share a curious thought, question, or response..."
              style={{ flex: 1, fontSize: '14px' }}
            />
            <button
              type="submit"
              disabled={!inputContent.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputContent.trim() ? 1 : 0.6,
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '15px' }}>
          Select a match from the left to start a curious conversation.
        </div>
      )}
    </div>
  );
};
