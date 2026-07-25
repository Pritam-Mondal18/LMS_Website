import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

// Extracted sub-components
import LocalVideo from './meeting/LocalVideo';
import RemoteVideo from './meeting/RemoteVideo';
import MeetingTopBar from './meeting/MeetingTopBar';
import MeetingBottomBar from './meeting/MeetingBottomBar';
import MeetingChatPanel from './meeting/MeetingChatPanel';
import MeetingSettingsModal from './meeting/MeetingSettingsModal';

export default function Meeting() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  const myPeerId = user?._id || user?.id || `user-${Math.random().toString(36).substr(2, 9)}`;
  const myName = user?.name || 'Guest';
  const myRole = user?.role || 'student';

  const getMeetingTitle = () => {
    if (!meetingId) return 'Live Classroom Session';
    const parts = meetingId.split('-');
    if (parts.length >= 3) {
      const words = parts.slice(1, -2).map(w => w.charAt(0).toUpperCase() + w.slice(1));
      return `${words.join(' ')} Class`;
    }
    return 'Live Classroom Session';
  };

  const [sessionTitle, setSessionTitle] = useState(getMeetingTitle());
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peers, setPeers] = useState([]);

  // Call controls
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Chat / panel
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 'mock-1', senderName: 'Riya S.', senderRole: 'student', message: "Good morning, everyone! Excited for today's class.", timestamp: '10:30 AM', reactions: { emoji: '❤️', count: 4 } },
    { id: 'mock-2', senderName: 'Arjun D.', senderRole: 'student', message: "Yes ma'am! Let's learn something new today.", timestamp: '10:31 AM', reactions: { emoji: '👍', count: 2 } },
    { id: 'mock-3', senderName: 'Teacher (You)', senderRole: 'teacher', message: "Great! Let's begin with today's topic - Confidence in Speaking. 😎", timestamp: '10:32 AM', reactions: { emoji: '❤️', count: 6 } },
  ]);
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1458);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isRecording, setIsRecording] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [newAnswerInput, setNewAnswerInput] = useState('');
  const [hostPermissions, setHostPermissions] = useState({ allowScreenShare: true, allowChat: true, allowMic: true, allowCam: true });
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatEmojis, setShowChatEmojis] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [qaQuestions, setQaQuestions] = useState([
    { id: 'q-1', question: "How can we practice speaking English daily without a partner?", askedBy: "Riya S.", timestamp: "10:35 AM", answers: [{ answeredBy: "Teacher (You)", answer: "Try mirror practice, talk to yourself, or use voice recording apps to analyze your speaking!", timestamp: "10:37 AM" }] },
    { id: 'q-2', question: "Will there be any assessment test at the end of this course?", askedBy: "Arjun D.", timestamp: "10:40 AM", answers: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Refs
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const camOnRef = useRef(true);
  const micOnRef = useRef(true);
  const pcs = useRef({});
  const chatBottomRef = useRef(null);
  const containerRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, style: { left: `${Math.random() * 80 + 10}%` } }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000);
  };

  const handleIncrementMessageReaction = (msgId) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.reactions) {
        return { ...msg, reactions: { ...msg.reactions, count: msg.reactions.count + 1 } };
      }
      return msg;
    }));
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;
    const newQ = { id: `q-${Date.now()}`, question: newQuestionInput.trim(), askedBy: myName + (myRole === 'teacher' ? ' (You)' : ''), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), answers: [] };
    setQaQuestions(prev => [...prev, newQ]);
    setNewQuestionInput('');
  };

  const handleAnswerQuestion = (questionId) => {
    if (!newAnswerInput.trim()) return;
    setQaQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, answers: [...q.answers, { answeredBy: myName + (myRole === 'teacher' ? ' (You)' : ''), answer: newAnswerInput.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] };
      }
      return q;
    }));
    setNewAnswerInput('');
    setAnsweringQuestionId(null);
  };

  const handleChatToggle = () => {
    if (!showChat) { setShowChat(true); setActiveTab('chat'); }
    else { if (activeTab === 'chat') setShowChat(false); else setActiveTab('chat'); }
  };
  const handleParticipantsToggle = () => {
    if (!showChat) { setShowChat(true); setActiveTab('participants'); }
    else { if (activeTab === 'participants') setShowChat(false); else setActiveTab('participants'); }
  };
  const handleInfoToggle = () => {
    if (!showChat) { setShowChat(true); setActiveTab('qa'); }
    else { if (activeTab === 'qa') setShowChat(false); else setActiveTab('qa'); }
  };
  const handleSecurityToggle = () => {
    if (!showChat) { setShowChat(true); setActiveTab('security'); }
    else { if (activeTab === 'security') setShowChat(false); else setActiveTab('security'); }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // ── WebRTC ─────────────────────────────────────────────────────────────────

  async function makeCall(peerId) {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await api.post(`/live-classes/meeting/${meetingId}/signal`, { from: myPeerId, to: peerId, signalData: { type: 'offer', sdp: offer } });
    } catch (e) { console.error(`Error calling peer ${peerId}:`, e); }
  }

  function createPeerConnection(peerId) {
    if (pcs.current[peerId]) pcs.current[peerId].close();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcs.current[peerId] = pc;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        api.post(`/live-classes/meeting/${meetingId}/signal`, { from: myPeerId, to: peerId, signalData: { type: 'candidate', candidate: event.candidate } }).catch(console.error);
      }
    };
    pc.ontrack = (event) => {
      if (event.streams?.[0]) setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };
    return pc;
  }

  async function handleSignal(signal) {
    const { from, signalData } = signal;
    try {
      if (signalData.type === 'hostPermissions') {
        setHostPermissions(signalData.permissions);
      } else if (signalData.type === 'offer') {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await api.post(`/live-classes/meeting/${meetingId}/signal`, { from: myPeerId, to: from, signalData: { type: 'answer', sdp: answer } });
      } else if (signalData.type === 'answer') {
        const pc = pcs.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
      } else if (signalData.type === 'candidate') {
        const pc = pcs.current[from];
        if (pc && signalData.candidate) await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
      }
    } catch (e) { console.error('Error processing signal:', e); }
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  const toggleCam = () => {
    if (myRole === 'student' && !hostPermissions.allowCam) return;
    if (isScreenSharing) { camOnRef.current = !camOnRef.current; setCamOn(camOnRef.current); return; }
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; camOnRef.current = videoTrack.enabled; setCamOn(videoTrack.enabled); }
    }
  };

  const toggleMic = () => {
    if (myRole === 'student' && !hostPermissions.allowMic) return;
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; micOnRef.current = audioTrack.enabled; setMicOn(audioTrack.enabled); }
    }
  };

  const stopScreenSharing = async () => {
    try {
      if (screenTrackRef.current) screenTrackRef.current.stop();
      const camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 24 } });
      const camTrack = camStream.getVideoTracks()[0];
      camTrack.enabled = camOnRef.current;
      Object.values(pcs.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
      });
      const audioTrack = localStreamRef.current?.getAudioTracks()[0];
      const newStream = new MediaStream(audioTrack ? [audioTrack, camTrack] : [camTrack]);
      localStreamRef.current = newStream;
      setLocalStream(newStream);
      setIsScreenSharing(false);
    } catch (err) { console.error('Error stopping screen share:', err); setIsScreenSharing(false); }
  };

  const toggleScreenShare = async () => {
    if (myRole === 'student' && !hostPermissions.allowScreenShare) return;
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        Object.values(pcs.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        if (localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) oldVideoTrack.stop();
        }
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        const newStream = new MediaStream(audioTrack ? [audioTrack, screenTrack] : [screenTrack]);
        localStreamRef.current = newStream;
        setLocalStream(newStream);
        setIsScreenSharing(true);
        screenTrack.onended = () => stopScreenSharing();
      } else {
        stopScreenSharing();
      }
    } catch (err) { console.error('Screen sharing error:', err); }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (myRole === 'student' && !hostPermissions.allowChat) return;
    const messageToSend = chatInput.trim();
    setChatInput('');
    try {
      await api.post(`/live-classes/meeting/${meetingId}/chat`, { senderName: myName, senderRole: myRole, message: messageToSend });
    } catch (err) { console.error('Chat dispatch failed:', err); }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleLeaveCall = async () => {
    if (myRole === 'teacher') {
      const confirmEnd = window.confirm('Do you want to END the class for all participants? (This will automatically generate and publish the recording)');
      if (confirmEnd) {
        try {
          await api.post(`/live-classes/meeting/${meetingId}/end`);
          alert('Live class ended. Recording published to student feeds.');
        } catch (err) { console.error('Failed to end class:', err); }
      }
    }
    navigate(-1);
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  // Broadcast host permissions changes
  useEffect(() => {
    if (myRole !== 'teacher' || peers.length === 0) return;
    const timer = setTimeout(() => {
      peers.forEach(peer => {
        api.post(`/live-classes/meeting/${meetingId}/signal`, { from: myPeerId, to: peer.peerId, signalData: { type: 'hostPermissions', permissions: hostPermissions } }).catch(console.error);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [hostPermissions, peers, meetingId, myPeerId, myRole]);

  // Initialise local media stream
  useEffect(() => {
    let activeStream = null;
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 24 }, audio: true });
        activeStream = stream;
        localStreamRef.current = stream;
        camOnRef.current = stream.getVideoTracks()[0]?.enabled ?? false;
        micOnRef.current = stream.getAudioTracks()[0]?.enabled ?? false;
        setLocalStream(stream);
        const res = await api.post(`/live-classes/meeting/${meetingId}/join`, { peerId: myPeerId, name: myName, role: myRole });
        if (res.data.success) {
          const others = res.data.others || [];
          setPeers(others);
          if (res.data.title) setSessionTitle(res.data.title);
          for (const peer of others) {
            if (myPeerId < peer.peerId) await makeCall(peer.peerId);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Meeting init error:', err);
        if (activeStream) activeStream.getTracks().forEach(t => t.stop());
        setError(err.response?.data?.message || 'Could not access camera or microphone. Please check permissions.');
        setLoading(false);
      }
    }
    initMedia();
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (screenTrackRef.current) screenTrackRef.current.stop();
      api.post(`/live-classes/meeting/${meetingId}/leave`, { peerId: myPeerId }).catch(console.error);
      Object.values(pcs.current).forEach(pc => pc.close());
    };
  }, [meetingId]);

  // Poll WebRTC signals every 1200ms
  useEffect(() => {
    if (loading || error) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/live-classes/meeting/${meetingId}/signals?peerId=${myPeerId}`);
        if (res.data.success) {
          setConsecutiveFailures(0);
          const { signals, participants, chats } = res.data;
          const activePeers = (participants || []).filter(p => p.peerId !== myPeerId);
          setPeers(activePeers);
          if (chats?.length > 0) setChatMessages(chats);
          const activePeerIds = activePeers.map(p => p.peerId);
          Object.keys(pcs.current).forEach(pid => {
            if (!activePeerIds.includes(pid)) {
              pcs.current[pid].close();
              delete pcs.current[pid];
              setRemoteStreams(prev => { const next = { ...prev }; delete next[pid]; return next; });
            }
          });
          for (const sig of signals) await handleSignal(sig);
        }
      } catch (e) {
        console.error('Signaling poll error:', e);
        setConsecutiveFailures(prev => prev + 1);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [loading, error]);

  // Session timer
  useEffect(() => {
    if (loading || error || !isRecording) return;
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [loading, error, isRecording]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChat]);

  // Current time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close popups on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('.relative')) return;
      setShowLayoutMenu(false);
      setShowMoreMenu(false);
      setShowReactions(false);
      setShowChatEmojis(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Reset scroll
  useEffect(() => {
    const handleScroll = () => {
      window.scrollTo(0, 0);
      if (containerRef.current) { containerRef.current.scrollTop = 0; containerRef.current.scrollLeft = 0; }
    };
    window.addEventListener('scroll', handleScroll);
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Enforce host permissions for student
  useEffect(() => {
    if (myRole !== 'student') return;
    if (!hostPermissions.allowMic && micOn) {
      if (localStreamRef.current) { const t = localStreamRef.current.getAudioTracks()[0]; if (t) t.enabled = false; }
      micOnRef.current = false; setMicOn(false);
    }
    if (!hostPermissions.allowCam && camOn) {
      if (localStreamRef.current) { const t = localStreamRef.current.getVideoTracks()[0]; if (t) t.enabled = false; }
      camOnRef.current = false; setCamOn(false);
    }
    if (!hostPermissions.allowScreenShare && isScreenSharing) stopScreenSharing();
  }, [hostPermissions, myRole, micOn, camOn, isScreenSharing]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-[#070125] text-white flex flex-col z-50 overflow-hidden font-sans relative">
      {/* Background glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#B13BFF]/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#FF2E93]/5 blur-[130px] rounded-full pointer-events-none"></div>

      {/* Connectivity Status Banner */}
      {consecutiveFailures >= 3 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-red-500/90 backdrop-blur-md text-white border border-red-500/25 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">
              Network Reconnecting... ({consecutiveFailures}s)
            </span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      {!loading && !error && (
        <MeetingTopBar
          sessionTitle={sessionTitle}
          peers={peers}
          timerSeconds={timerSeconds}
          isRecording={isRecording}
          formatTimer={formatTimer}
          copiedInvite={copiedInvite}
          copyInviteLink={copyInviteLink}
          showLayoutMenu={showLayoutMenu}
          setShowLayoutMenu={setShowLayoutMenu}
          isSpotlight={isSpotlight}
          setIsSpotlight={setIsSpotlight}
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
          showChat={showChat}
          activeTab={activeTab}
          handleSecurityToggle={handleSecurityToggle}
          handleInfoToggle={handleInfoToggle}
          handleLeaveCall={handleLeaveCall}
          myRole={myRole}
          setShowSettingsModal={setShowSettingsModal}
          toggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Main Workspace */}
      <div className={`flex-grow flex h-[calc(100vh-9rem)] md:h-[calc(100vh-11rem)] max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-11rem)] min-h-0 overflow-hidden relative z-10 bg-[#070125] p-2 md:p-4 ${showChat ? 'pr-2 md:pr-6 gap-2 md:gap-4' : 'pr-2 md:pr-4'}`}>

        {/* Video Content Wrapper */}
        <div className={`flex-grow flex-col min-h-0 overflow-hidden border border-[#B13BFF]/15 bg-[#090040]/10 rounded-2xl md:rounded-[32px] shadow-inner relative ${showChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Floating Reactions */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {floatingReactions.map(r => (
              <div key={r.id} className="absolute bottom-10 text-4xl animate-reaction pointer-events-none" style={r.style}>{r.emoji}</div>
            ))}
          </div>

          <style>{`
            @keyframes floatUp {
              0% { transform: translateY(0) scale(0.5); opacity: 0; }
              15% { transform: translateY(-20px) scale(1.2); opacity: 1; }
              100% { transform: translateY(-250px) scale(1); opacity: 0; }
            }
            .animate-reaction { animation: floatUp 2.5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards; }
            @keyframes bounceBar { 0%, 100% { height: 3px; } 50% { height: 12px; } }
            .animate-bar-1 { animation: bounceBar 0.8s ease-in-out infinite; }
            .animate-bar-2 { animation: bounceBar 0.5s ease-in-out infinite 0.15s; }
            .animate-bar-3 { animation: bounceBar 0.7s ease-in-out infinite 0.3s; }
            .animate-bar-4 { animation: bounceBar 0.6s ease-in-out infinite 0.05s; }
            .animate-bar-5 { animation: bounceBar 0.9s ease-in-out infinite 0.2s; }
          `}</style>

          {/* Video Grid */}
          <div className="flex-grow p-4 md:p-6 flex flex-col items-center justify-center overflow-hidden h-full">
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <Loader2 className="w-10 h-10 text-[#FF2E93] animate-spin" />
                <p className="text-[#9e97e2] text-xs font-black tracking-wider uppercase animate-pulse">Establishing classroom server connections...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 max-w-md p-8 glass-card border-red-500/20 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner border border-red-500/20">⚠️</div>
                <h3 className="text-lg font-black text-white">Permission Failed</h3>
                <p className="text-xs text-[#9e97e2] leading-relaxed">{error}</p>
                <button onClick={() => navigate(-1)} className="btn-primary py-3 text-xs font-bold w-full rounded-2xl">Go Back to Dashboard</button>
              </div>
            ) : (
              <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center">
                <div className={`w-full h-full ${isSpotlight
                  ? 'flex flex-col md:flex-row gap-4'
                  : `grid gap-4 auto-rows-fr ${peers.length === 0 ? 'grid-cols-1' : peers.length === 1 ? 'grid-cols-1 md:grid-cols-2' : peers.length === 2 ? 'grid-cols-1 md:grid-cols-3' : peers.length <= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`
                }`}>
                  {isSpotlight ? (
                    <>
                      <div className={`flex-grow h-2/3 md:h-full relative min-h-[200px] md:min-h-[300px] flex items-center justify-center w-full ${peers.length > 0 ? 'md:w-3/4' : 'w-full'}`}>
                        {localStream && <LocalVideo stream={localStream} name={myName} role={myRole} camOn={camOn} micOn={micOn} isHandRaised={isHandRaised} isScreenSharing={isScreenSharing} />}
                      </div>
                      {peers.length > 0 && (
                        <div className="w-full md:w-1/4 h-24 min-[375px]:h-28 md:h-full flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto pr-1 shrink-0">
                          {peers.map((peer) => {
                            const stream = remoteStreams[peer.peerId];
                            return (
                              <div key={peer.peerId} className="w-36 min-[375px]:w-44 md:w-full h-full md:h-40 shrink-0 flex items-center justify-center">
                                {stream ? <RemoteVideo stream={stream} name={peer.name} role={peer.role} /> : (
                                  <div className="relative bg-[#0F0052]/20 border border-[#B13BFF]/15 border-dashed rounded-2xl md:rounded-[24px] w-full h-full flex flex-col items-center justify-center gap-1 shadow-inner">
                                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#B13BFF]/20 flex items-center justify-center text-[9px] md:text-[10px] font-black text-[#B13BFF]">{peer.name.charAt(0)}</div>
                                    <span className="text-[7px] md:text-[8px] text-[#9e97e2] font-black uppercase tracking-wider">Syncing...</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {localStream && (
                        <div className="w-full h-full flex items-center justify-center">
                          <LocalVideo stream={localStream} name={myName} role={myRole} camOn={camOn} micOn={micOn} isHandRaised={isHandRaised} isScreenSharing={isScreenSharing} />
                        </div>
                      )}
                      {peers.map((peer) => {
                        const stream = remoteStreams[peer.peerId];
                        return (
                          <div key={peer.peerId} className="w-full h-full flex items-center justify-center">
                            {stream ? <RemoteVideo stream={stream} name={peer.name} role={peer.role} /> : (
                              <div className="relative bg-[#0F0052]/20 border border-[#B13BFF]/15 border-dashed rounded-[32px] aspect-video max-w-full max-h-full w-auto h-auto flex flex-col items-center justify-center gap-3 shadow-inner group hover:border-[#FF2E93]/30 transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-[#B13BFF]/20 flex items-center justify-center text-xs font-black text-[#B13BFF] animate-pulse">{peer.name.charAt(0)}</div>
                                <span className="text-[10px] text-[#9e97e2] font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF2E93]" /> Syncing {peer.name}...
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <MeetingChatPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setShowChat={setShowChat}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendChat={handleSendChat}
            showChatEmojis={showChatEmojis}
            setShowChatEmojis={setShowChatEmojis}
            handleIncrementMessageReaction={handleIncrementMessageReaction}
            chatBottomRef={chatBottomRef}
            peers={peers}
            myName={myName}
            myRole={myRole}
            micOn={micOn}
            camOn={camOn}
            remoteStreams={remoteStreams}
            hostPermissions={hostPermissions}
            qaQuestions={qaQuestions}
            newQuestionInput={newQuestionInput}
            setNewQuestionInput={setNewQuestionInput}
            handleAskQuestion={handleAskQuestion}
            answeringQuestionId={answeringQuestionId}
            setAnsweringQuestionId={setAnsweringQuestionId}
            newAnswerInput={newAnswerInput}
            setNewAnswerInput={setNewAnswerInput}
            handleAnswerQuestion={handleAnswerQuestion}
            hostPermissionsState={hostPermissions}
            setHostPermissions={setHostPermissions}
          />
        )}
      </div>

      {/* Bottom Bar */}
      {!loading && !error && (
        <MeetingBottomBar
          currentTime={currentTime}
          meetingId={meetingId}
          copied={copied}
          copyMeetingId={copyMeetingId}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          micOn={micOn}
          camOn={camOn}
          isHandRaised={isHandRaised}
          setIsHandRaised={setIsHandRaised}
          isScreenSharing={isScreenSharing}
          toggleMic={toggleMic}
          toggleCam={toggleCam}
          toggleScreenShare={toggleScreenShare}
          handleLeaveCall={handleLeaveCall}
          handleParticipantsToggle={handleParticipantsToggle}
          handleChatToggle={handleChatToggle}
          showChat={showChat}
          activeTab={activeTab}
          peers={peers}
          myRole={myRole}
          hostPermissions={hostPermissions}
          showReactions={showReactions}
          setShowReactions={setShowReactions}
          floatingReactions={floatingReactions}
          triggerReaction={triggerReaction}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <MeetingSettingsModal
          micOn={micOn}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
