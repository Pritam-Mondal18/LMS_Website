import React, { useEffect, useRef, useState } from 'react';
import { MicOff, Maximize2, Hand } from 'lucide-react';
import LogoPlaceholder from './LogoPlaceholder';

const LocalVideo = ({ stream, name, role, camOn, micOn, isHandRaised, isScreenSharing }) => {
  const videoRef = useRef();
  const [networkQuality, setNetworkQuality] = useState('1080p');

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const updateConnectionInfo = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!conn) {
        setNetworkQuality('1080p');
        return;
      }

      const { effectiveType, downlink } = conn;
      if (effectiveType === '4g') {
        if (downlink >= 5) {
          setNetworkQuality('1080p');
        } else if (downlink >= 1.5) {
          setNetworkQuality('720p');
        } else {
          setNetworkQuality('480p');
        }
      } else if (effectiveType === '3g') {
        if (downlink >= 0.8) {
          setNetworkQuality('480p');
        } else {
          setNetworkQuality('360p');
        }
      } else {
        setNetworkQuality('240p');
      }
    };

    updateConnectionInfo();

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateConnectionInfo);
      return () => conn.removeEventListener('change', updateConnectionInfo);
    }
  }, []);

  return (
    <div className="relative bg-[#070125] border border-brand-purple/25 rounded-3xl overflow-hidden aspect-video max-w-full max-h-full w-auto h-auto flex items-center justify-center group shadow-2xl hover:border-brand-pink/50 transition-all duration-500 hover:shadow-brand-purple/10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isScreenSharing ? '' : 'scale-x-[-1]'} ${(camOn || isScreenSharing) ? '' : 'opacity-0'}`}
      />
      {!(camOn || isScreenSharing) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <LogoPlaceholder />
        </div>
      )}

      {/* Top Left Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <div className="bg-[#0F0A36]/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase text-white shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E93] animate-pulse"></span>
          Live
        </div>
        <div className="bg-[#0F0A36]/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase text-white shadow-lg">
          <svg viewBox="0 0 100 100" className={`w-2.5 h-2.5 ${networkQuality === '1080p' ? 'fill-emerald-400' : networkQuality === '720p' ? 'fill-emerald-400/80' : networkQuality === '480p' ? 'fill-yellow-400' : networkQuality === '360p' ? 'fill-orange-400' : 'fill-red-400'}`}>
            <rect x="10" y="70" width="15" height="20" rx="2" />
            <rect x="35" y="50" width="15" height="40" rx="2" className={networkQuality === '240p' ? 'opacity-30' : ''} />
            <rect x="60" y="30" width="15" height="60" rx="2" className={['240p', '360p'].includes(networkQuality) ? 'opacity-30' : ''} />
            <rect x="85" y="10" width="15" height="80" rx="2" className={['240p', '360p', '480p'].includes(networkQuality) ? 'opacity-30' : ''} />
          </svg>
          {networkQuality}
        </div>
      </div>

      {/* Top Right Fullscreen Button */}
      <button
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
          } else {
            document.exitFullscreen();
          }
        }}
        className="absolute top-4 right-4 bg-[#0F0A36]/60 backdrop-blur-md border border-white/10 p-2 rounded-xl text-white/80 hover:text-white hover:scale-105 transition-all shadow-lg z-20"
        title="Toggle Fullscreen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Bottom Left Info Badge */}
      <div className="absolute bottom-4 left-4 bg-[#0F0A36]/75 backdrop-blur-md px-3.5 py-1.5 rounded-2xl flex items-center gap-2 border border-brand-pink/20 shadow-lg z-20">
        <span className="w-2 h-2 rounded-full bg-[#B13BFF] animate-pulse"></span>
        <span className="text-[11px] font-semibold text-white/90 tracking-wide flex items-center gap-2">
          {name} (You)
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${role === 'teacher' ? 'bg-[#FF2E93] text-white shadow-sm' : 'bg-[#B13BFF] text-white shadow-sm'}`}>
            {role}
          </span>
          {micOn ? (
            <div className="flex items-end gap-[2.5px] h-3 w-6 ml-1 select-none">
              <div className="w-[2px] bg-[#FF2E93] rounded-full animate-bar-1 h-1.5"></div>
              <div className="w-[2px] bg-[#FF2E93] rounded-full animate-bar-2 h-3"></div>
              <div className="w-[2px] bg-[#FF2E93] rounded-full animate-bar-3 h-2"></div>
              <div className="w-[2px] bg-[#FF2E93] rounded-full animate-bar-4 h-2.5"></div>
              <div className="w-[2px] bg-[#FF2E93] rounded-full animate-bar-5 h-1"></div>
            </div>
          ) : (
            <MicOff className="w-3.5 h-3.5 text-red-400 inline" />
          )}
        </span>
      </div>
      {isHandRaised && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white p-2.5 rounded-full shadow-lg border border-yellow-400 animate-bounce z-20">
          <Hand className="w-5 h-5 fill-white text-white" />
        </div>
      )}
    </div>
  );
};

export default LocalVideo;
