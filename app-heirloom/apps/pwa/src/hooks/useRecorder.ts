import { useState, useRef, useCallback } from 'react';

interface UseRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  seconds: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setIsRecording(true);
      setIsPaused(false);
      setSeconds(0);
      setAudioBlob(null);
      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [startTimer]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        setAudioBlob(blob);

        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        resolve(blob);
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    });
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }, [isRecording, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [isPaused, startTimer]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);
    setSeconds(0);
    setAudioBlob(null);
    stopTimer();
  }, [isRecording, stopTimer]);

  return {
    isRecording,
    isPaused,
    seconds,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
