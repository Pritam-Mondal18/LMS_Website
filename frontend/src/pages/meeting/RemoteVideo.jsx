import React, { useEffect, useRef, useState } from 'react';
import { MicOff } from 'lucide-react';
import LogoPlaceholder from './LogoPlaceholder';

const RemoteVideo = ({ stream, name, role }) => {
  const videoRef = useRef();
  const [videoActive, setVideoActive] = useState(true);
  const [audioActive, setAudioActive] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        setVideoActive(videoTrack.enabled && !videoTrack.muted);
        const handleVideoChange = () => {
          setVideoActive(videoTrack.enabled && !videoTrack.muted);
        };
        videoTrack.addEventListener('mute', handleVideoChange);
        videoTrack.addEventListener('unmute', handleVideoChange);
        videoTrack.addEventListener('ended', handleVideoChange);
      } else {
        setVideoActive(false);
      }

      if (audioTrack) {
        setAudioActive(audioTrack.enabled && !audioTrack.muted);
        const handleAudioChange = () => {
          setAudioActive(audioTrack.enabled && !audioTrack.muted);
        };
        audioTrack.addEventListener('mute', handleAudioChange);
        audioTrack.addEventListener('unmute', handleAudioChange);
        audioTrack.addEventListener('ended', handleAudioChange);
      } else {
        setAudioActive(false);
      }

      const timer = setInterval(() => {
        if (videoTrack) setVideoActive(videoTrack.enabled && !videoTrack.muted);
        if (audioTrack) setAudioActive(audioTrack.enabled && !audioTrack.muted);
      }, 1000);

      return () => {
        clearInterval(timer);
        if (videoTrack) {
          videoTrack.removeEventListener('mute', handleVideoChange);
          videoTrack.removeEventListener('unmute', handleVideoChange);
          videoTrack.removeEventListener('ended', handleVideoChange);
        }
        if (audioTrack) {
          audioTrack.removeEventListener('mute', handleAudioChange);
          audioTrack.removeEventListener('unmute', handleAudioChange);
          audioTrack.removeEventListener('ended', handleAudioChange);
        }
      };
    }
  }, [stream]);

  return (
    <div className="relative bg-[#070125] border border-brand-purple/20 rounded-3xl overflow-hidden aspect-video max-w-full max-h-full w-auto h-auto flex items-center justify-center group shadow-2xl hover:border-brand-pink/40 transition-all duration-500 hover:shadow-brand-purple/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${videoActive ? '' : 'opacity-0'}`}
      />
      {!videoActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <LogoPlaceholder />
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-[#090040]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[11px] font-bold text-white tracking-wide flex items-center gap-1.5">
          {name}
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${role === 'teacher' ? 'bg-[#FF2E93] text-white shadow-sm' : 'bg-[#B13BFF] text-white shadow-sm'}`}>
            {role}
          </span>
          {!audioActive && <MicOff className="w-3 h-3 text-red-400 inline" />}
        </span>
      </div>
    </div>
  );
};

export default RemoteVideo;
