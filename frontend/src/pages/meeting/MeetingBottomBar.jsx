import React from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, Phone,
  CircleDot, Users, MessageSquare, Copy, Check, Hand
} from 'lucide-react';

const MeetingBottomBar = ({
  currentTime,
  meetingId,
  copied,
  copyMeetingId,
  isRecording,
  setIsRecording,
  micOn,
  camOn,
  isHandRaised,
  setIsHandRaised,
  isScreenSharing,
  toggleMic,
  toggleCam,
  toggleScreenShare,
  handleLeaveCall,
  handleParticipantsToggle,
  handleChatToggle,
  showChat,
  activeTab,
  peers,
  myRole,
  hostPermissions,
  showReactions,
  setShowReactions,
  floatingReactions,
  triggerReaction,
}) => {
  return (
    <div className="h-20 md:h-24 shrink-0 bg-[#070125] border-t border-[#B13BFF]/20 px-3 md:px-8 flex items-center justify-between z-30 relative shadow-2xl select-none">
      {/* Left: Meeting Info & Timer */}
      <div className="hidden md:flex items-center gap-3 text-sm text-gray-300 font-semibold select-none">
        <span>{currentTime}</span>
        <span className="text-white/20">|</span>
        <button
          onClick={copyMeetingId}
          className="font-mono tracking-wider hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none"
          title="Click to copy meeting ID"
        >
          {meetingId}
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          )}
        </button>
        {isRecording && (
          <>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-xs text-brand-pink font-bold bg-[#FF2E93]/10 px-2.5 py-0.5 rounded-md border border-[#FF2E93]/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E93]"></span>
              REC
            </span>
          </>
        )}
      </div>

      {/* Center: Control Deck */}
      <div className="flex items-center gap-2 md:gap-3 relative">
        {/* Reactions Floating Drawer */}
        {showReactions && (
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 bg-[#090040]/95 backdrop-blur-xl border border-[#B13BFF]/30 p-2 rounded-xl md:rounded-2xl flex items-center gap-1.5 md:gap-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-3 duration-250 select-none">
            {['💖', '👍', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => { triggerReaction(emoji); setShowReactions(false); }}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:scale-125 hover:bg-white/10 active:scale-95 transition-all text-base md:text-lg rounded-lg md:rounded-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Mic */}
        <button
          onClick={toggleMic}
          disabled={myRole === 'student' && !hostPermissions.allowMic}
          className={`h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${micOn ? 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md' : 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93]/30 shadow-md'} ${myRole === 'student' && !hostPermissions.allowMic ? 'opacity-30 cursor-not-allowed' : ''}`}
          title={myRole === 'student' && !hostPermissions.allowMic ? 'Mic disabled by host' : micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          <div className="flex items-center">
            {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
          </div>
        </button>

        {/* Video */}
        <button
          onClick={toggleCam}
          disabled={myRole === 'student' && !hostPermissions.allowCam}
          className={`h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${camOn ? 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md' : 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93]/30 shadow-md'} ${myRole === 'student' && !hostPermissions.allowCam ? 'opacity-30 cursor-not-allowed' : ''}`}
          title={myRole === 'student' && !hostPermissions.allowCam ? 'Camera disabled by host' : camOn ? 'Stop Cam' : 'Start Cam'}
        >
          <div className="flex items-center">
            {camOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4" />}
          </div>
        </button>

        {/* Raise Hand */}
        <button
          onClick={() => setIsHandRaised(!isHandRaised)}
          className={`h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${isHandRaised ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30 shadow-md' : 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md'}`}
          title="Raise Hand"
        >
          <Hand className={`w-4 h-4 ${isHandRaised ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} />
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          disabled={myRole === 'student' && !hostPermissions.allowScreenShare}
          className={`hidden sm:flex h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex-col items-center justify-center gap-1 transition-all border ${isScreenSharing ? 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93]/30 shadow-md' : 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md'} ${myRole === 'student' && !hostPermissions.allowScreenShare ? 'opacity-30 cursor-not-allowed' : ''}`}
          title={myRole === 'student' && !hostPermissions.allowScreenShare ? 'Screen sharing disabled by host' : 'Share Screen'}
        >
          <Monitor className="w-4 h-4 text-white" />
        </button>

        {/* Record */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`hidden sm:flex h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex-col items-center justify-center gap-1 transition-all border ${isRecording ? 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93]/30 shadow-md' : 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md'}`}
          title={isRecording ? 'Stop Recording' : 'Record Session'}
        >
          <CircleDot className={`w-4 h-4 ${isRecording ? 'animate-pulse text-[#FF2E93]' : 'text-white'}`} />
        </button>

        {/* Hang Up */}
        <div className="flex items-center shrink-0">
          <button
            onClick={handleLeaveCall}
            className="h-11 w-11 md:h-[58px] md:w-[68px] bg-[#FF2E93] hover:bg-[#E0267F] text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 border border-[#FF2E93]/40"
            title="Leave Call"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5 transform rotate-[135deg] origin-center text-white" />
          </button>
        </div>
      </div>

      {/* Right: Participants & Chat */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          onClick={handleParticipantsToggle}
          className={`h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border relative ${showChat && activeTab === 'participants' ? 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] shadow-md' : 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md'}`}
          title="Participants"
        >
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-[9px] md:text-[10px] font-extrabold text-[#FF2E93]">{peers.length > 0 ? peers.length + 1 : 24}</span>
          </div>
        </button>

        <button
          onClick={handleChatToggle}
          className={`h-11 w-11 md:h-[58px] md:w-[68px] rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border relative ${showChat && activeTab === 'chat' ? 'bg-[#FF2E93]/20 border-[#FF2E93]/40 text-[#FF2E93] shadow-md' : 'bg-[#0E0734]/80 border-[#B13BFF]/20 text-white hover:bg-white/5 hover:border-brand-pink/30 shadow-md'}`}
          title="Toggle Chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-2 bg-[#FF2E93] text-white text-[7px] md:text-[8px] font-extrabold px-1 rounded-full border border-[#070125]">
              24
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MeetingBottomBar;
