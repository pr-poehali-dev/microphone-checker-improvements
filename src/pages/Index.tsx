import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SecretCasino } from '@/components/SecretCasino';
import { VolumeControl } from '@/components/VolumeControl';
import { MicrophoneHeader } from '@/components/MicrophoneHeader';
import { MicrophoneTest } from '@/components/MicrophoneTest';
import { DeviceInstructions } from '@/components/DeviceInstructions';
import { useStandoffSounds } from '@/hooks/useStandoffSounds';
import { useMicrophoneTest } from '@/hooks/useMicrophoneTest';

const Index = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [soundVolume, setSoundVolume] = useState(0.3);

  // Включаем звуки только для темы Standoff 2
  useStandoffSounds(currentTheme === 'standoff', soundVolume);

  // Используем хук для тестирования микрофона
  const {
    testStatus,
    audioLevel,
    deviceInfo,
    microphoneName,
    hasPermission,
    maxLevelDetected,
    startMicTest,
    stopMicTest
  } = useMicrophoneTest();

  useEffect(() => {
    // Отслеживаем изменение громкости
    const handleVolumeChange = () => {
      const volume = parseFloat(localStorage.getItem('standoff-volume') || '0.3');
      setSoundVolume(volume);
    };

    handleVolumeChange();
    window.addEventListener('standoff-volume-change', handleVolumeChange);

    return () => {
      window.removeEventListener('standoff-volume-change', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    // Отслеживаем изменение темы
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(savedTheme);
    };
    
    checkTheme();
    window.addEventListener('storage', checkTheme);
    
    // Проверяем тему каждую секунду (на случай изменения без storage event)
    const interval = setInterval(checkTheme, 1000);
    
    return () => {
      window.removeEventListener('storage', checkTheme);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 green:from-green-50 green:via-white green:to-green-50 brown:from-amber-50 brown:via-orange-50 brown:to-yellow-50">
      <ThemeSwitcher />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <MicrophoneHeader />
        
        <MicrophoneTest
          testStatus={testStatus}
          audioLevel={audioLevel}
          microphoneName={microphoneName}
          hasPermission={hasPermission}
          maxLevelDetected={maxLevelDetected}
          onStart={startMicTest}
          onStop={stopMicTest}
        />

        <DeviceInstructions
          os={deviceInfo.os}
          browser={deviceInfo.browser}
        />
      </div>
      <SecretCasino />
      <VolumeControl />
    </div>
  );
};

export default Index;