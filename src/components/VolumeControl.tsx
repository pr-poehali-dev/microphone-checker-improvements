import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

export const VolumeControl = () => {
  const [volume, setVolume] = useState(30);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Загружаем сохранённую громкость
    const savedVolume = parseFloat(localStorage.getItem('standoff-volume') || '0.3');
    setVolume(savedVolume * 100);

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
    
    // Сохраняем в localStorage
    const volumeDecimal = newVolume / 100;
    localStorage.setItem('standoff-volume', volumeDecimal.toString());
    
    // Уведомляем другие компоненты
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
          <div className="flex items-center gap-4">
            <Icon 
              name={volume === 0 ? "VolumeX" : volume < 50 ? "Volume1" : "Volume2"} 
              size={24} 
              className="text-orange-400"
            />
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
            Регулирует звуки кликов, наведения и эффектов
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
