import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

export const MicrophoneHeader = () => {
  const [isStandoff, setIsStandoff] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem('theme');
      setIsStandoff(theme === 'standoff');
    };

    checkTheme();
    const interval = setInterval(checkTheme, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
        <Icon name="Mic" size={40} className="text-primary" />
      </div>
      <h1 className="text-5xl font-bold text-foreground mb-4">
        {isStandoff ? 'VOICE CHECK' : 'Проверка микрофона'}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {isStandoff 
          ? 'Test your microphone. Press button and speak. Promo code for bonus: casino'
          : 'Убедитесь, что ваш микрофон работает правильно. Нажмите кнопку ниже и начните говорить.'}
      </p>
    </div>
  );
};