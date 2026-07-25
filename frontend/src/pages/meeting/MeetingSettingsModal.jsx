import React from 'react';
import { X } from 'lucide-react';

const MeetingSettingsModal = ({ micOn, onClose }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#070125]/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="w-[92%] max-w-[450px] bg-[#090040] border border-[#B13BFF]/30 p-5 md:p-6 rounded-2xl md:rounded-[32px] shadow-2xl relative select-none animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#B13BFF]/20 text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all focus:outline-none"
          title="Close Settings"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-extrabold text-white mb-2">Classroom Device Settings</h3>
        <p className="text-[10px] text-gray-400 mb-6 leading-normal">Select your default mic/camera hardware and view real-time diagnostics.</p>

        <div className="space-y-4">
          {/* Camera Selection */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] uppercase font-black tracking-widest text-[#B13BFF]">Video Input Camera</label>
            <select className="w-full bg-[#070125] border border-[#B13BFF]/25 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E93]">
              <option>Default Integrated WebCam (1280x720)</option>
              <option>FaceTime HD Camera (External)</option>
              <option>OBS Virtual Camera Output</option>
            </select>
          </div>

          {/* Microphone Selection */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] uppercase font-black tracking-widest text-[#B13BFF]">Audio Input Microphone</label>
            <select className="w-full bg-[#070125] border border-[#B13BFF]/25 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E93]">
              <option>Default Integrated Microphone Array</option>
              <option>External USB Condenser Microphone</option>
              <option>AirPods Hands-Free Audio Input</option>
            </select>
          </div>

          {/* Audio Diagnostic Wave */}
          <div className="flex flex-col gap-2 text-left pt-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-[#B13BFF]">Mic Voice Level Test</label>
            <div className="h-10 bg-[#070125] border border-[#B13BFF]/15 rounded-xl flex items-center justify-center gap-1.5 px-4">
              {micOn ? (
                <div className="flex items-end gap-1 h-5">
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.8s_infinite] h-2"></div>
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.6s_infinite] h-4"></div>
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.9s_infinite] h-3"></div>
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.5s_infinite] h-5"></div>
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.7s_infinite] h-1.5"></div>
                  <div className="w-1.5 bg-[#FF2E93] rounded-full animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
              ) : (
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Microphone is Muted</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#FF2E93] hover:bg-[#E0267F] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#FF2E93]/20 transition-all active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSettingsModal;
