import { useEffect } from 'react';

// URL звуковых эффектов (похожих на Standoff 2)
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Клик по кнопке
  hover: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Наведение
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Успех
  error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // Ошибка
};

export const useStandoffSounds = (enabled: boolean, volume: number = 0.3) => {
  useEffect(() => {
    if (!enabled) return;

    const audioCache: { [key: string]: HTMLAudioElement } = {};

    // Предзагрузка звуков
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.preload = 'auto';
      audioCache[key] = audio;
    });

    // Обновление громкости при изменении
    const updateVolume = () => {
      const savedVolume = parseFloat(localStorage.getItem('standoff-volume') || '0.3');
      Object.values(audioCache).forEach(audio => {
        audio.volume = savedVolume;
      });
    };

    window.addEventListener('standoff-volume-change', updateVolume);

    const playSound = (soundKey: string) => {
      const audio = audioCache[soundKey];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Игнорируем ошибки автовоспроизведения
        });
      }
    };

    // Обработчик кликов
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target && target.tagName === 'BUTTON' || (target && typeof target.closest === 'function' && target.closest('button'))) {
        playSound('click');
      }
    };

    // Обработчик наведения на кнопки
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target && target.tagName === 'BUTTON' || (target && typeof target.closest === 'function' && target.closest('button'))) {
        playSound('hover');
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver, true);

    // Слушаем события успеха/ошибки через кастомные события
    const handleSuccess = () => playSound('success');
    const handleError = () => playSound('error');

    window.addEventListener('standoff-success', handleSuccess);
    window.addEventListener('standoff-error', handleError);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver, true);
      window.removeEventListener('standoff-success', handleSuccess);
      window.removeEventListener('standoff-error', handleError);
      window.removeEventListener('standoff-volume-change', updateVolume);
    };
  }, [enabled, volume]);
};

// Утилиты для триггера звуков из компонентов
export const triggerSuccessSound = () => {
  window.dispatchEvent(new Event('standoff-success'));
};

export const triggerErrorSound = () => {
  window.dispatchEvent(new Event('standoff-error'));
};