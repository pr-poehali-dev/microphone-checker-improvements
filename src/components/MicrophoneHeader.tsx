import Icon from '@/components/ui/icon';

export const MicrophoneHeader = () => {
  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
        <Icon name="Mic" size={40} className="text-primary" />
      </div>
      <h1 className="text-5xl font-bold text-foreground mb-4">
        Проверка микрофона
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Убедитесь, что ваш микрофон работает правильно. Нажмите кнопку ниже и начните говорить.
      </p>
    </div>
  );
};
