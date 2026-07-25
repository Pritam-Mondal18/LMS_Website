import React from 'react';
import { X, Send, Smile, Info, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const MOCK_STUDENTS = [
  { name: 'Riya Sharma' }, { name: 'Arjun Das' }, { name: 'Sneha Kapoor' },
  { name: 'Rohit Mehta' }, { name: 'Aditi Verma' }, { name: 'Vikram Singh' },
  { name: 'Pooja Iyer' }, { name: 'Ananya Roy' }, { name: 'Kabir Sen' },
  { name: 'Ishita Bose' }, { name: 'Nikhil Rao' }, { name: 'Meera Nair' },
  { name: 'Siddharth Pal' }, { name: 'Divya Joshi' }, { name: 'Rohan Gupta' },
  { name: 'Kriti Saxena' }, { name: 'Aarav Patel' }, { name: 'Zara Khan' },
  { name: 'Deepak Jha' }, { name: 'Tanvi Shah' }, { name: 'Yash Sharma' },
  { name: 'Karan Malhotra' }, { name: 'Sanya Malhotra' },
];

const MeetingChatPanel = ({
  activeTab, setActiveTab, setShowChat,
  chatMessages, chatInput, setChatInput,
  handleSendChat, showChatEmojis, setShowChatEmojis,
  handleIncrementMessageReaction, chatBottomRef,
  peers, myName, myRole, micOn, camOn, remoteStreams,
  hostPermissions,
  qaQuestions, newQuestionInput, setNewQuestionInput,
  handleAskQuestion, answeringQuestionId, setAnsweringQuestionId,
  newAnswerInput, setNewAnswerInput, handleAnswerQuestion,
  hostPermissionsState: { allowScreenShare, allowChat, allowMic, allowCam },
  setHostPermissions,
}) => {
  return (
    <div className="w-full md:w-96 h-full shrink-0 flex flex-col justify-between bg-[#080228] border border-[#B13BFF]/25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl relative z-25 animate-in slide-in-from-right duration-300">
      {/* Sidebar Header with Tabs */}
      <div className="border-b border-[#B13BFF]/10 bg-[#0F0052]/10 pt-2 md:pt-3 shrink-0">
        <div className="flex items-center justify-between px-4 pb-2 md:pb-1.5 select-none">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-pink">
            {activeTab === 'chat' ? 'Class Chat' : activeTab === 'participants' ? 'Participants' : activeTab === 'qa' ? 'Questions & Answers' : 'Host Security'}
          </span>
          <button
            onClick={() => setShowChat(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex px-2 md:px-4">
          {['chat', 'participants', 'qa'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center pb-2 md:pb-2.5 text-[10px] min-[375px]:text-[11px] md:text-xs font-bold border-b-2 transition-all capitalize ${activeTab === tab ? 'border-[#FF2E93] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              {tab === 'qa' ? 'Q&A' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {myRole === 'teacher' && (
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 text-center pb-2 md:pb-2.5 text-[10px] min-[375px]:text-[11px] md:text-xs font-bold border-b-2 transition-all ${activeTab === 'security' ? 'border-[#FF2E93] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Security
            </button>
          )}
        </div>
      </div>

      {/* --- Chat Tab --- */}
      {activeTab === 'chat' && (
        <div className="flex-grow flex flex-col min-h-0 bg-[#080228]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <div className="text-center my-2 select-none">
              <span className="text-[10px] text-gray-500 font-bold bg-[#0F0052]/30 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
            </div>
            {chatMessages.map((msg) => {
              const getAvatarColor = (name) => {
                if (name.includes('Teacher') || name === myName) return 'bg-[#B13BFF]';
                if (name.startsWith('Riya')) return 'bg-[#FF2E93]';
                if (name.startsWith('Arjun')) return 'bg-blue-600';
                return 'bg-emerald-600';
              };
              return (
                <div key={msg.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.senderName)} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div className="flex-grow flex flex-col">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-white">{msg.senderName}</span>
                      <span className="text-[8px] text-gray-400 font-semibold">{msg.timestamp}</span>
                    </div>
                    <div className="p-3 bg-[#140c5c]/40 border border-white/5 text-xs text-gray-200 rounded-2xl rounded-tl-none leading-relaxed max-w-[95%] shadow-sm">
                      <p className="break-words">{msg.message}</p>
                    </div>
                    {msg.reactions && (
                      <div className="flex mt-1">
                        <span
                          onClick={() => handleIncrementMessageReaction(msg.id)}
                          className="inline-flex items-center gap-1 bg-[#090040]/80 border border-[#B13BFF]/10 px-2 py-0.5 rounded-full text-[9px] font-bold text-gray-300 hover:text-white hover:border-[#FF2E93]/30 transition-colors shadow-sm select-none cursor-pointer"
                        >
                          <span>{msg.reactions.emoji}</span>
                          <span>{msg.reactions.count}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
          <form onSubmit={handleSendChat} className="p-4 border-t border-[#B13BFF]/10 bg-[#0F0052]/10 flex flex-col gap-2 relative">
            {showChatEmojis && (
              <div className="absolute bottom-16 left-4 right-4 bg-[#090040]/95 backdrop-blur-xl border border-[#B13BFF]/30 p-2 rounded-xl flex items-center justify-between gap-1 shadow-2xl z-40 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                {['😀', '😂', '👍', '❤️', '🔥', '🎉', '😎', '👏'].map((emoji) => (
                  <button key={emoji} type="button" onClick={() => { setChatInput(prev => prev + emoji); setShowChatEmojis(false); }} className="w-8 h-8 flex items-center justify-center hover:scale-125 hover:bg-white/10 active:scale-95 transition-all text-base rounded-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex items-center bg-[#070125] border border-[#B13BFF]/20 rounded-2xl px-4 py-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={myRole === 'student' && !allowChat}
                placeholder={myRole === 'student' && !allowChat ? 'Chat has been disabled by the host' : 'Type a message...'}
                className="flex-grow bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button type="button" onClick={() => setShowChatEmojis(!showChatEmojis)} className={`hover:text-white transition-colors mr-2 ${showChatEmojis ? 'text-[#FF2E93]' : 'text-gray-400'}`}>
                <Smile className="w-5 h-5" />
              </button>
              <button type="submit" disabled={myRole === 'student' && !allowChat} className="bg-[#FF2E93] hover:bg-[#E0267F] p-2 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4 text-white fill-white" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 px-2 mt-1 select-none">
              <span>Messages are visible to everyone</span>
              <Info className="w-3.5 h-3.5 text-gray-500 cursor-pointer" />
            </div>
          </form>
        </div>
      )}

      {/* --- Participants Tab --- */}
      {activeTab === 'participants' && (
        <div className="flex-grow flex flex-col min-h-0 bg-[#080228]">
          <div className="flex-grow overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            <div className="flex items-center justify-between p-2.5 bg-[#140c5c]/30 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B13BFF] flex items-center justify-center text-xs font-bold text-white shadow-md">{myName.charAt(0)}</div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white">{myName} (You)</span>
                  <span className="text-[8px] uppercase font-black text-[#B13BFF] tracking-wider mt-1">{myRole}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                {camOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
            {peers.map((peer) => (
              <div key={peer.peerId} className="flex items-center justify-between p-2.5 bg-[#140c5c]/20 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF2E93] flex items-center justify-center text-xs font-bold text-white shadow-md">{peer.name.charAt(0)}</div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-white">{peer.name}</span>
                    <span className="text-[8px] uppercase font-black text-[#FF2E93] tracking-wider mt-1">{peer.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {remoteStreams[peer.peerId] ? (
                    <><Mic className="w-3.5 h-3.5 text-emerald-400" /><Video className="w-3.5 h-3.5 text-emerald-400" /></>
                  ) : (
                    <><MicOff className="w-3.5 h-3.5 text-red-400" /><VideoOff className="w-3.5 h-3.5 text-red-400" /></>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 py-1.5 select-none">
              <span className="text-[8.5px] text-gray-500 uppercase font-black tracking-widest shrink-0">Other Class Members ({24 - 1 - peers.length})</span>
              <div className="h-[1px] bg-white/10 flex-grow"></div>
            </div>
            {MOCK_STUDENTS.slice(0, Math.max(0, 24 - 1 - peers.length)).map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-[#140c5c]/10 rounded-2xl transition-colors">
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-[#0F0052] border border-[#B13BFF]/25 flex items-center justify-center text-xs font-bold text-gray-300">{student.name.charAt(0)}</div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-white">{student.name}</span>
                    <span className="text-[8px] uppercase font-black text-gray-400 tracking-wider mt-1">student</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MicOff className="w-3.5 h-3.5" /><VideoOff className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Q&A Tab --- */}
      {activeTab === 'qa' && (
        <div className="flex-grow flex flex-col min-h-0 bg-[#080228]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {qaQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs select-none">No questions asked yet. Ask the first question below!</div>
            ) : (
              qaQuestions.map((q) => (
                <div key={q.id} className="p-3 bg-[#140c5c]/30 border border-white/5 rounded-2xl space-y-2 text-left animate-in fade-in duration-200">
                  <div className="flex items-baseline justify-between select-none">
                    <span className="text-[10px] font-extrabold text-[#FF2E93]">{q.askedBy}</span>
                    <span className="text-[8px] text-gray-400">{q.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">{q.question}</p>
                  {q.answers.length > 0 && (
                    <div className="pl-3.5 border-l-2 border-[#B13BFF]/40 space-y-2.5 mt-2">
                      {q.answers.map((ans, aIdx) => (
                        <div key={aIdx} className="space-y-1">
                          <div className="flex items-baseline justify-between select-none">
                            <span className="text-[9px] font-extrabold text-[#B13BFF]">{ans.answeredBy}</span>
                            <span className="text-[8px] text-gray-500">{ans.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-gray-300 leading-relaxed">{ans.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-1 flex items-center justify-end">
                    {answeringQuestionId === q.id ? (
                      <div className="w-full flex flex-col gap-1.5 mt-2">
                        <textarea
                          value={newAnswerInput}
                          onChange={(e) => setNewAnswerInput(e.target.value)}
                          placeholder="Type your answer..."
                          className="w-full bg-[#070125] border border-[#B13BFF]/20 rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF2E93] h-14 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => { setAnsweringQuestionId(null); setNewAnswerInput(''); }} className="px-2.5 py-1 text-[9px] font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                          <button type="button" onClick={() => handleAnswerQuestion(q.id)} className="px-3 py-1 text-[9px] font-bold bg-[#FF2E93] text-white rounded-lg hover:bg-[#E0267F] transition-colors">Submit Answer</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAnsweringQuestionId(q.id); setNewAnswerInput(''); }} className="text-[9px] text-[#B13BFF] font-bold hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 select-none">
                        <span>💬</span> Answer
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAskQuestion} className="p-4 border-t border-[#B13BFF]/10 bg-[#0F0052]/10 flex flex-col gap-2">
            <div className="relative flex items-center bg-[#070125] border border-[#B13BFF]/20 rounded-2xl px-4 py-2">
              <input
                type="text"
                value={newQuestionInput}
                onChange={(e) => setNewQuestionInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none pr-8"
              />
              <button type="submit" className="bg-[#B13BFF] hover:bg-[#971DFF] p-2 rounded-xl flex items-center justify-center transition-all shrink-0">
                <Send className="w-4 h-4 text-white fill-white" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 px-2 mt-1 select-none">
              <span>Ask a question to the host</span>
              <Info className="w-3.5 h-3.5 cursor-pointer" />
            </div>
          </form>
        </div>
      )}

      {/* --- Security/Host Controls Tab --- */}
      {activeTab === 'security' && (
        <div className="flex-grow flex flex-col min-h-0 bg-[#080228] p-4 text-left space-y-6 overflow-y-auto scrollbar-thin">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1">Host Controls</h3>
            <p className="text-[10px] text-gray-400 leading-normal">Use these settings to keep your class safe and orderly.</p>
          </div>
          <div className="space-y-4">
            {[
              { key: 'allowScreenShare', label: 'Share screen', desc: 'Allow students to share screens', value: allowScreenShare },
              { key: 'allowChat', label: 'Send chat messages', desc: 'Allow students to post in chat', value: allowChat },
              { key: 'allowMic', label: 'Turn on microphone', desc: 'Allow students to unmute', value: allowMic },
              { key: 'allowCam', label: 'Turn on camera', desc: 'Allow students to turn on camera', value: allowCam },
            ].map(({ key, label, desc, value }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-[#140c5c]/20 border border-white/5 rounded-2xl">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white leading-none">{label}</span>
                  <span className="text-[8.5px] text-gray-500 mt-1">{desc}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={value} onChange={() => setHostPermissions(prev => ({ ...prev, [key]: !prev[key] }))} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#070125] border border-[#B13BFF]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-[#FF2E93] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF2E93]/20 peer-checked:border-[#FF2E93]"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mt-4">
            <p className="text-[9.5px] text-emerald-400 leading-normal font-bold">
              🛡️ Host security settings are active. Disabled permissions will apply to student participants instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingChatPanel;
