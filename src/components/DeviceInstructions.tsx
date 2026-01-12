import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

type OSType = 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown';

interface DeviceInstructionsProps {
  os: OSType;
  browser: string;
}

export const DeviceInstructions = ({ os, browser }: DeviceInstructionsProps) => {
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
    
    return instructions[os] || instructions.Unknown;
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={24} className="text-primary" />
            Информация о системе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Операционная система</p>
              <p className="font-semibold text-lg">{os}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Браузер</p>
              <p className="font-semibold text-lg">{browser}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">
            <Icon name="Settings" size={18} className="mr-2" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="tips">
            <Icon name="Lightbulb" size={18} className="mr-2" />
            Советы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Wrench" size={24} className="text-primary" />
                Инструкция для {os}
              </CardTitle>
              <CardDescription>
                Следуйте этим шагам для настройки микрофона
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {getOSInstructions().map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
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
                <Icon name="Lightbulb" size={24} className="text-primary" />
                Советы по устранению неполадок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Icon name="Volume2" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Проверьте громкость</h4>
                    <p className="text-sm text-muted-foreground">
                      Убедитесь, что уровень громкости микрофона в системных настройках не на минимуме.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Icon name="Cable" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Проверьте подключение</h4>
                    <p className="text-sm text-muted-foreground">
                      Если используете внешний микрофон, проверьте надёжность подключения кабеля.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Icon name="Download" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Обновите драйверы</h4>
                    <p className="text-sm text-muted-foreground">
                      Устаревшие драйверы могут вызывать проблемы. Проверьте наличие обновлений.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Icon name="Headphones" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Попробуйте другое устройство</h4>
                    <p className="text-sm text-muted-foreground">
                      Если у вас несколько микрофонов, попробуйте выбрать другой в настройках системы.
                    </p>
                  </div>
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
                onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
              >
                <Icon name="ExternalLink" size={18} />
                Связаться с поддержкой
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
