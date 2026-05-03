"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useChatSocket } from "@/src/hooks/useChatSocket";
import { createChatPeerConnection, stopMediaStream } from "@/src/lib/chat/webrtc";
import { startRoomCall, updateCallStatus } from "@/src/services/chatRoom.service";

type CallState = "idle" | "ringing" | "incoming" | "active";

type SignalPayload = {
  type: "offer" | "answer" | "ice-candidate";
  callId?: string;
  senderId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

export const useWebRTCCall = (roomId?: string) => {
  const {
    currentUser,
    incomingCall,
    setIncomingCall,
    clearIncomingCall,
    emit,
    onEvent,
    offEvent,
  } = useChatSocket(roomId);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingOfferRef = useRef<SignalPayload | null>(null);

  const [callState, setCallState] = useState<CallState>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const cleanupCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingOfferRef.current = null;
    stopMediaStream(localStream);
    stopMediaStream(remoteStream);
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setCallId(null);
    clearIncomingCall();
  };

  const ensureLocalStream = async () => {
    if (localStream) {
      return localStream;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setLocalStream(stream);
    return stream;
  };

  const ensurePeerConnection = async (nextCallId?: string) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const stream = await ensureLocalStream();
    const peer = createChatPeerConnection({
      onIceCandidate: (candidate) => {
        if (!roomId) {
          return;
        }

        emit("signal", {
          roomId,
          signalData: {
            type: "ice-candidate",
            callId: nextCallId ?? callId,
            senderId: currentUser?.userId,
            candidate: candidate.toJSON(),
          },
        });
      },
      onRemoteTrack: (streamValue) => setRemoteStream(streamValue),
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peerConnectionRef.current = peer;

    return peer;
  };

  const startCall = async () => {
    if (!roomId || !currentUser) {
      return;
    }

    try {
      const createdCall = await startRoomCall(roomId).catch(() => null);
      const nextCallId = createdCall?.id ?? `call-${Date.now()}`;

      setCallId(nextCallId);
      const peer = await ensurePeerConnection(nextCallId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      setCallState("ringing");
      emit("signal", {
        roomId,
        signalData: {
          type: "offer",
          callId: nextCallId,
          senderId: currentUser.userId,
          sdp: offer,
        },
      });
    } catch (error) {
      cleanupCall();
      toast.error(error instanceof Error ? error.message : "Unable to start the call.");
    }
  };

  const acceptCall = async () => {
    if (!roomId || !pendingOfferRef.current) {
      return;
    }

    try {
      const nextCallId = pendingOfferRef.current.callId ?? incomingCall?.callId ?? `call-${Date.now()}`;
      setCallId(nextCallId);
      const peer = await ensurePeerConnection(nextCallId);

      if (pendingOfferRef.current.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current.sdp));
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      emit("signal", {
        roomId,
        signalData: {
          type: "answer",
          callId: nextCallId,
          senderId: currentUser?.userId,
          sdp: answer,
        },
      });

      setCallState("active");
      clearIncomingCall();
    } catch (error) {
      cleanupCall();
      toast.error(error instanceof Error ? error.message : "Unable to accept the call.");
    }
  };

  const declineCall = async () => {
    if (incomingCall?.callId) {
      await updateCallStatus(incomingCall.callId, "DECLINED").catch(() => null);
    }

    cleanupCall();
  };

  const endCall = async () => {
    if (callId) {
      await updateCallStatus(callId, "ENDED").catch(() => null);
    }

    cleanupCall();
  };

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const handleSignal = async (payload: any) => {
      const signalData = (payload?.signalData ?? payload) as SignalPayload;
      const payloadRoomId = String(payload?.roomId ?? roomId);

      if (payloadRoomId !== roomId || signalData.senderId === currentUser?.userId) {
        return;
      }

      try {
        if (signalData.type === "offer") {
          pendingOfferRef.current = signalData;
          setCallId(signalData.callId ?? null);
          setIncomingCall({
            roomId,
            callId: signalData.callId,
            callerId: payload?.callerId ?? signalData.senderId,
            callerName: payload?.callerName,
          });
          setCallState("incoming");
          return;
        }

        if (signalData.type === "answer" && signalData.sdp && peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(signalData.sdp),
          );
          setCallState("active");
          return;
        }

        if (signalData.type === "ice-candidate" && signalData.candidate && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Call signaling failed.");
      }
    };

    const handleCallEnded = (payload: any) => {
      if (String(payload?.roomId ?? roomId) !== roomId) {
        return;
      }

      cleanupCall();
    };

    onEvent("signal", handleSignal);
    onEvent("call_ended", handleCallEnded);

    return () => {
      offEvent("signal", handleSignal);
      offEvent("call_ended", handleCallEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, currentUser?.userId, offEvent, onEvent]);

  useEffect(() => {
    return () => {
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    callId,
    callState,
    isInCall: callState === "ringing" || callState === "incoming" || callState === "active",
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    declineCall,
    endCall,
  };
};

export default useWebRTCCall;
