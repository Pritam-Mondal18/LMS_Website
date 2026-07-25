import React from 'react';
import {
  Users, Check, Phone, LayoutGrid, Shield, MoreVertical,
  Info
} from 'lucide-react';

const MeetingTopBar = ({
  sessionTitle,
  peers,
  timerSeconds,
  isRecording,
  formatTimer,
  copiedInvite,
  copyInviteLink,
  showLayoutMenu,
  setShowLayoutMenu,
  isSpotlight,
  setIsSpotlight,
  showMoreMenu,
  setShowMoreMenu,
  showChat,
  activeTab,
  handleSecurityToggle,
  handleInfoToggle,
  handleLeaveCall,
  myRole,
  setShowSettingsModal,
  toggleFullscreen,
}) => {
  return (
    <div className="h-16 md:h-20 shrink-0 border-b border-[#B13BFF]/20 bg-[#070125] px-4 md:px-6 flex items-center justify-between z-30 shadow-lg relative select-none">
      {/* Left: Meeting Info, Timer & Copier */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 100 100" className="w-7 h-7 md:w-8 md:h-8 select-none relative z-10">
            <path d="M 30 15 H 70 L 45 65 H 30 A 25 25 0 0 1 30 15 Z" fill="#FF2E93" />
            <path d="M 70 85 H 30 L 55 35 H 70 A 25 25 0 0 1 70 85 Z" fill="#3B3DB6" />
            <path d="M 55 35 H 60 L 45 65 H 40 Z" fill="#1E1163" />
          </svg>
          <div className="hidden sm:flex flex-col text-left select-none leading-none">
            <span className="font-signature text-white text-lg font-medium tracking-wide">
              Sumit Chakraborty
            </span>
            <div className="flex items-center gap-1 w-24 mt-0.5">
              <div className="h-[1px] bg-white/20 flex-grow"></div>
              <span className="uppercase font-bold text-[#FF2E93] text-[7px] tracking-[0.2em] leading-none shrink-0">
                Academy
              </span>
              <div className="h-[1px] bg-white/20 flex-grow"></div>
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden sm:block mx-1 shrink-0"></div>

        <div className="flex flex-col select-none text-left justify-center min-w-0">
          <span className="text-white text-xs md:text-[13px] font-semibold tracking-wide flex items-center gap-1.5 select-none min-w-0">
            <span className="truncate max-w-[100px] min-[375px]:max-w-[140px] min-[425px]:max-w-[180px] sm:max-w-[250px] md:max-w-none">
              {sessionTitle || 'Live Classroom Session'}
            </span>
            <span className="shrink-0 text-white/60 text-[10px] md:text-xs font-normal hidden xs:inline">- Live Session</span>
            <Info
              onClick={handleInfoToggle}
              className="w-3.5 h-3.5 text-gray-400 inline cursor-pointer hover:text-white shrink-0"
            />
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] md:text-[10px] text-gray-400 font-bold shrink-0">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />
              <span>{peers.length > 0 ? peers.length + 1 : 24}</span>
            </div>
            <span className="text-white/10">|</span>
            <span>{formatTimer(timerSeconds)}</span>
            {isRecording && (
              <>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E93] animate-pulse"></span>
                  <span className="hidden xs:inline">Recording</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Layout indicators & Leave */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          onClick={copyInviteLink}
          className="flex items-center gap-1 px-2.5 py-1.5 md:px-4 md:py-2 border border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93]/10 rounded-xl md:rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {copiedInvite ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold hidden md:inline">Copied URL!</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold leading-none">+</span>
              <span className="hidden md:inline">Invite</span>
            </>
          )}
        </button>

        <div className="relative">
          {showLayoutMenu && (
            <div className="absolute top-10 md:top-12 right-0 bg-[#090040]/95 backdrop-blur-xl border border-[#B13BFF]/30 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-3 duration-250 select-none w-44 text-left">
              <button
                type="button"
                onClick={() => { setIsSpotlight(false); setShowLayoutMenu(false); }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${!isSpotlight ? 'text-[#FF2E93] bg-[#FF2E93]/10 font-bold' : 'text-gray-200 hover:text-white hover:bg-white/10'}`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </span>
                {!isSpotlight && <Check className="w-3.5 h-3.5 text-[#FF2E93]" />}
              </button>
              <button
                type="button"
                onClick={() => { setIsSpotlight(true); setShowLayoutMenu(false); }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${isSpotlight ? 'text-[#FF2E93] bg-[#FF2E93]/10 font-bold' : 'text-gray-200 hover:text-white hover:bg-white/10'}`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Spotlight View</span>
                </span>
                {isSpotlight && <Check className="w-3.5 h-3.5 text-[#FF2E93]" />}
              </button>
            </div>
          )}
          <button
            onClick={() => { setShowLayoutMenu(!showLayoutMenu); setShowMoreMenu(false); }}
            className={`w-8 h-8 md:w-10 md:h-10 border rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${showLayoutMenu ? 'bg-[#FF2E93] border-[#FF2E93] text-white shadow-lg shadow-[#FF2E93]/20' : 'hover:bg-white/5 border-[#B13BFF]/15 text-gray-400 hover:text-white'}`}
            title="Change Layout"
          >
            <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {myRole === 'teacher' && (
          <button
            onClick={handleSecurityToggle}
            className={`w-8 h-8 md:w-10 md:h-10 border rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${showChat && activeTab === 'security' ? 'bg-[#FF2E93] border-[#FF2E93] text-white shadow-lg shadow-[#FF2E93]/20' : 'hover:bg-white/5 border-[#B13BFF]/15 text-emerald-400'}`}
            title="Host Controls"
          >
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        )}

        <div className="relative">
          {showMoreMenu && (
            <div className="absolute top-10 md:top-12 right-0 bg-[#090040]/95 backdrop-blur-xl border border-[#B13BFF]/30 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-3 duration-250 select-none w-52 text-left">
              <button type="button" onClick={() => { setIsSpotlight(!isSpotlight); setShowMoreMenu(false); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <span>📊</span>
                <span>Switch to {isSpotlight ? 'Grid View' : 'Spotlight View'}</span>
              </button>
              <button type="button" onClick={() => { toggleFullscreen(); setShowMoreMenu(false); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <span>🖥️</span>
                <span>{document.fullscreenElement ? 'Exit Full Screen' : 'Enter Full Screen'}</span>
              </button>
              <button type="button" onClick={() => { setShowSettingsModal(true); setShowMoreMenu(false); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <span>⚙️</span>
                <span>Settings & Diagnostics</span>
              </button>
            </div>
          )}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`w-8 h-8 md:w-10 md:h-10 border rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${showMoreMenu ? 'bg-[#FF2E93] border-[#FF2E93] text-white shadow-lg' : 'hover:bg-white/5 border-[#B13BFF]/15 text-gray-400 hover:text-white'}`}
          >
            <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        <button
          onClick={handleLeaveCall}
          className="hidden md:flex items-center gap-2 bg-[#FF2E93] hover:bg-[#E0267F] text-white font-bold text-sm px-6 py-2 rounded-2xl transition-all shadow-lg shadow-[#FF2E93]/20"
        >
          <Phone className="w-4 h-4 transform rotate-[135deg] origin-center text-white" /> Leave
        </button>
      </div>
    </div>
  );
};

export default MeetingTopBar;
