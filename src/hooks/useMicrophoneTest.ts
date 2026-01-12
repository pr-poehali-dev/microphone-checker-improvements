import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';
type OSType = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

export const useMicrophoneTest = () => {
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<{ os: OSType; browser: string }>({
    os: 'Unknown',
    browser: 'Unknown'
  });
  const [microphoneName, setMicrophoneName] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [maxLevelDetected, setMaxLevelDetected] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    detectDeviceInfo();
  }, []);

  const detectDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let os: OSType = 'Unknown';
    
    if (userAgent.indexOf('Win') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'iOS';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    
    let browser = 'Unknown';
    if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
    
    setDeviceInfo({ os, browser });
  };

  const startMicTest = async () => {
    try {
      // Увеличиваем счетчик запусков теста
      const currentCount = parseInt(localStorage.getItem('mic-test-count') || '0');
      localStorage.setItem('mic-test-count', String(currentCount + 1));
      
      // Уведомляем о разблокировке секретной темы
      if (currentCount + 1 === 22) {
        window.dispatchEvent(new Event('standoff-theme-unlocked'));
        toast.success('🎉 Секретная тема разблокирована!');
      }
      
      setTestStatus('testing');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInput = devices.find(device => 
        device.kind === 'audioinput' && device.deviceId === stream.getAudioTracks()[0].getSettings().deviceId
      );
      
      setMicrophoneName(audioInput?.label || 'Микрофон по умолчанию');
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let localMaxLevel = 0;
      
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);
        setAudioLevel(normalizedLevel);
        
        if (normalizedLevel > localMaxLevel) {
          localMaxLevel = normalizedLevel;
          setMaxLevelDetected(normalizedLevel);
        }
        
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      
      checkTimerRef.current = setTimeout(() => {
        if (localMaxLevel > 1) {
          setTestStatus('success');
          toast.success('Микрофон работает отлично!');
        } else {
          setTestStatus('error');
          toast.error('Микрофон не улавливает звук');
        }
      }, 5000);
      
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      setTestStatus('error');
      setHasPermission(false);
      toast.error('Не удалось получить доступ к микрофону');
    }
  };

  const stopMicTest = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
      checkTimerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setTestStatus('idle');
    setAudioLevel(0);
    setMaxLevelDetected(0);
  };

  return {
    testStatus,
    audioLevel,
    deviceInfo,
    microphoneName,
    hasPermission,
    maxLevelDetected,
    startMicTest,
    stopMicTest
  };
};