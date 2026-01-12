import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface MicrophoneTestProps {
  testStatus: TestStatus;
  audioLevel: number;
  microphoneName: string;
  hasPermission: boolean | null;
  maxLevelDetected: number;
  onStart: () => void;
  onStop: () => void;
}

export const MicrophoneTest = ({
  testStatus,
  audioLevel,
  microphoneName,
  hasPermission,
  maxLevelDetected,
  onStart,
  onStop
}: MicrophoneTestProps) => {
  const [testCount, setTestCount] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const count = parseInt(localStorage.getItem('mic-test-count') || '0');
      setTestCount(count);
      setShowProgress(count > 0 && count < 22);
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('standoff-theme-unlocked', updateCount);
    
    // Обновляем при каждом изменении статуса теста
    const interval = setInterval(updateCount, 500);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('standoff-theme-unlocked', updateCount);
      clearInterval(interval);
    };
  }, []);
  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TestTube" size={24} className="text-primary" />
          Тестирование
        </CardTitle>
        <CardDescription>
          Проверьте работу микрофона в реальном времени
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showProgress && (
          <Alert className="bg-purple-50 border-purple-200">
            <Icon name="Lock" className="text-purple-600" />
            <AlertDescription className="text-purple-800">
              Прогресс разблокировки секретной темы: {testCount}/22
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {testStatus === 'idle' || testStatus === 'error' ? (
            <Button 
              onClick={onStart}
              size="lg"
              className="flex-1 h-14 text-lg"
            >
              <Icon name="Play" className="mr-2" size={24} />
              Начать тест
            </Button>
          ) : (
            <Button 
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="flex-1 h-14 text-lg"
            >
              <Icon name="Square" className="mr-2" size={24} />
              Остановить
            </Button>
          )}
        </div>

        {testStatus === 'testing' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Уровень сигнала</span>
              <span className="font-semibold text-primary">{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} className="h-3" />
            <Alert className="bg-blue-50 border-blue-200">
              <Icon name="Info" className="text-blue-600" />
              <AlertDescription className="text-blue-800">
                Говорите в микрофон. Полоска должна реагировать на ваш голос.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {testStatus === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-green-50 border-green-200">
              <Icon name="CheckCircle2" className="text-green-600" />
              <AlertDescription className="text-green-800">
                Отлично! Ваш микрофон работает исправно.
              </AlertDescription>
            </Alert>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Устройство:</span>
                    <span className="font-medium">{microphoneName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Максимальный уровень:</span>
                    <span className="font-medium text-green-600">{Math.round(maxLevelDetected)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Статус:</span>
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <Icon name="Check" size={16} />
                      Работает
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {testStatus === 'error' && (
          <Alert className="bg-red-50 border-red-200">
            <Icon name="AlertCircle" className="text-red-600" />
            <AlertDescription className="text-red-800">
              Микрофон не работает или не улавливает звук. Проверьте настройки ниже.
            </AlertDescription>
          </Alert>
        )}

        {hasPermission === false && (
          <Alert className="bg-orange-50 border-orange-200">
            <Icon name="ShieldAlert" className="text-orange-600" />
            <AlertDescription className="text-orange-800">
              Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};