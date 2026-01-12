import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export const VolumeControl = () => {
  const [volume, setVolume] = useState(30);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(30);

  useEffect(() => {
    // Загружаем сохранённую громкость
    const savedVolume = parseFloat(localStorage.getItem('standoff-volume') || '0.3');
    const volumePercent = savedVolume * 100;
    setVolume(volumePercent);
    setPreviousVolume(volumePercent);
    setIsMuted(volumePercent === 0);

    // Проверяем активность темы Standoff
    const checkTheme = () => {
      const theme = localStorage.getItem('theme');
      setIsVisible(theme === 'standoff');
    };

    checkTheme();
    const interval = setInterval(checkTheme, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
    
    // Сохраняем в localStorage
    const volumeDecimal = newVolume / 100;
    localStorage.setItem('standoff-volume', volumeDecimal.toString());
    
    // Уведомляем другие компоненты
    window.dispatchEvent(new Event('standoff-volume-change'));
  };

  const toggleMute = () => {
    if (isMuted) {
      // Включаем звук
      const restoreVolume = previousVolume || 30;
      setVolume(restoreVolume);
      setIsMuted(false);
      localStorage.setItem('standoff-volume', (restoreVolume / 100).toString());
    } else {
      // Выключаем звук
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
      localStorage.setItem('standoff-volume', '0');
    }
    window.dispatchEvent(new Event('standoff-volume-change'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
      <Card className="w-80 border-2 border-orange-500/50 shadow-xl backdrop-blur-md bg-slate-900/90">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-400">
            <Icon name="Volume2" size={20} />
            Громкость звуков
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={toggleMute}
              className="shrink-0 border-orange-500/50 hover:bg-orange-500/20"
            >
              <Icon 
                name={isMuted ? "VolumeX" : volume < 50 ? "Volume1" : "Volume2"} 
                size={20} 
                className="text-orange-400"
              />
            </Button>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-orange-400 font-semibold w-12 text-right">
              {Math.round(volume)}%
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {isMuted ? '🔇 Звуки отключены' : '🔊 Регулирует звуки кликов, наведения и эффектов'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};