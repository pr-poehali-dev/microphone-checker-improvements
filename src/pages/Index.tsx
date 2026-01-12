import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';
type OSType = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

const Index = () => {
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

  const getOSInstructions = () => {
    const instructions = {
      Windows: [
        'Откройте "Параметры" → "Система" → "Звук"',
        'В разделе "Ввод" выберите нужный микрофон',
        'Нажмите "Свойства устройства" и проверьте громкость',
        'Убедитесь, что микрофон не отключен'
      ],
      macOS: [
        'Откройте "Системные настройки" → "Звук"',
        'Перейдите на вкладку "Вход"',
        'Выберите нужный микрофон из списка',
        'Проверьте уровень входной громкости'
      ],
      Linux: [
        'Откройте "Параметры" → "Звук"',
        'Выберите вкладку "Ввод"',
        'Проверьте выбранное устройство ввода',
        'Настройте уровень громкости'
      ],
      iOS: [
        'Откройте "Настройки" → "Конфиденциальность"',
        'Выберите "Микрофон"',
        'Разрешите доступ для браузера',
        'Перезагрузите страницу'
      ],
      Android: [
        'Откройте "Настройки" → "Приложения"',
        'Найдите ваш браузер',
        'Перейдите в "Разрешения"',
        'Включите доступ к микрофону'
      ],
      Unknown: [
        'Проверьте настройки звука в системе',
        'Убедитесь, что микрофон подключен',
        'Разрешите доступ к микрофону в браузере',
        'Попробуйте обновить драйверы'
      ]
    };
    
    return instructions[deviceInfo.os] || instructions.Unknown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 green:from-green-50 green:via-white green:to-green-50">
      <ThemeSwitcher />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Icon name="Mic" size={40} className="text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Проверка микрофона
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Быстрая диагностика и настройка вашего микрофона
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-2 animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon name="Info" size={24} className="text-primary" />
              <div>
                <CardTitle>Информация об устройстве</CardTitle>
                <CardDescription>
                  Автоматически определено: {deviceInfo.os} • {deviceInfo.browser}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {microphoneName && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Headphones" size={18} className="text-muted-foreground" />
                <span className="font-medium">{microphoneName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon name="TestTube" size={24} className="text-primary" />
              Тестирование
            </CardTitle>
            <CardDescription>
              Нажмите кнопку и произнесите что-нибудь в микрофон
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  testStatus === 'testing' 
                    ? 'bg-primary/20 mic-pulse' 
                    : testStatus === 'success'
                    ? 'bg-green-100'
                    : testStatus === 'error'
                    ? 'bg-red-100'
                    : 'bg-muted'
                }`}>
                  <Icon 
                    name={
                      testStatus === 'success' ? 'CheckCircle' :
                      testStatus === 'error' ? 'XCircle' :
                      'Mic'
                    } 
                    size={64} 
                    className={
                      testStatus === 'testing' 
                        ? 'text-primary' 
                        : testStatus === 'success'
                        ? 'text-green-600'
                        : testStatus === 'error'
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }
                  />
                </div>
              </div>

              {testStatus === 'testing' && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Уровень звука</span>
                    <span className="font-semibold">{Math.round(audioLevel)}%</span>
                  </div>
                  <Progress value={audioLevel} className="h-3" />
                  <p className="text-sm text-center text-muted-foreground">
                    Говорите в микрофон...
                  </p>
                </div>
              )}

              {testStatus === 'idle' && (
                <Button 
                  onClick={startMicTest} 
                  size="lg" 
                  className="gap-2 px-8"
                >
                  <Icon name="Play" size={20} />
                  Начать тест
                </Button>
              )}

              {testStatus === 'testing' && (
                <Button 
                  onClick={stopMicTest} 
                  variant="destructive" 
                  size="lg"
                  className="gap-2 px-8"
                >
                  <Icon name="Square" size={20} />
                  Остановить
                </Button>
              )}

              {(testStatus === 'success' || testStatus === 'error') && (
                <Button 
                  onClick={stopMicTest} 
                  variant="outline" 
                  size="lg"
                  className="gap-2 px-8"
                >
                  <Icon name="RotateCcw" size={20} />
                  Повторить тест
                </Button>
              )}
            </div>

            {testStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Icon name="CheckCircle" className="text-green-600" />
                <AlertDescription className="text-green-800">
                  Отлично! Ваш микрофон работает корректно и улавливает звук.
                </AlertDescription>
              </Alert>
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
              <Alert className="bg-yellow-50 border-yellow-200">
                <Icon name="ShieldAlert" className="text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="setup" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="gap-2">
              <Icon name="Settings" size={18} />
              Настройка
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-2">
              <Icon name="Lightbulb" size={18} />
              Советы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wrench" size={24} className="text-primary" />
                  Инструкция для {deviceInfo.os}
                </CardTitle>
                <CardDescription>
                  Следуйте этим шагам для настройки микрофона
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {getOSInstructions().map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-foreground">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} className="text-primary" />
                  Полезные советы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 p-4 bg-accent rounded-lg">
                  <Icon name="Volume2" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Проверьте физическое подключение</h4>
                    <p className="text-sm text-muted-foreground">
                      Убедитесь, что микрофон правильно подключен к компьютеру. Попробуйте другой USB-порт.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-accent rounded-lg">
                  <Icon name="Shield" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Разрешения браузера</h4>
                    <p className="text-sm text-muted-foreground">
                      Проверьте, что сайт имеет разрешение на использование микрофона в настройках браузера.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-accent rounded-lg">
                  <Icon name="RefreshCw" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Обновите драйверы</h4>
                    <p className="text-sm text-muted-foreground">
                      Устаревшие драйверы могут вызывать проблемы. Проверьте наличие обновлений.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-accent rounded-lg">
                  <Icon name="Headphones" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Попробуйте другое устройство</h4>
                    <p className="text-sm text-muted-foreground">
                      Если у вас несколько микрофонов, попробуйте выбрать другой в настройках системы.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/20 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="HelpCircle" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Нужна помощь?</h3>
                <p className="text-muted-foreground mb-4">
                  Если проблема не решается, попробуйте перезагрузить компьютер или обратитесь в службу поддержки производителя устройства.
                </p>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open('https://t.me/domestosiik', '_blank')}
                >
                  <Icon name="ExternalLink" size={18} />
                  Связаться с поддержкой
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;