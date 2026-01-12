import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useStandoffSounds } from '@/hooks/useStandoffSounds';

const SYMBOLS = ['🍒', '🍋', '💎', '7️⃣', '⭐', '🔔'];
const BET_OPTIONS = [10, 25, 50, 100, 250];

export const SecretCasino = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [keySequence, setKeySequence] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newSequence = [...keySequence, e.key].slice(-6);
      setKeySequence(newSequence);
      
      // Секретный код: casino
      if (newSequence.join('') === 'casino') {
        setIsOpen(true);
        setMessage('🎰 Добро пожаловать в секретное казино!');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keySequence]);

  const spin = () => {
    if (balance < bet) {
      setMessage('❌ Недостаточно монет!');
      return;
    }

    setSpinning(true);
    setBalance(balance - bet);
    setMessage('🎰 Крутим...');

    let spins = 0;
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
      spins++;

      if (spins > 15) {
        clearInterval(spinInterval);
        checkWin();
      }
    }, 100);
  };

  const checkWin = () => {
    setSpinning(false);
    
    const finalReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];
    
    setReels(finalReels);

    // Проверка выигрыша с учетом ставки
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const baseWin = finalReels[0] === '💎' ? 50 : 
                      finalReels[0] === '7️⃣' ? 30 : 10;
      const winAmount = baseWin * bet;
      setBalance(balance => balance + winAmount);
      setMessage(`🎉 ДЖЕКПОТ! +${winAmount} монет!`);
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
      const winAmount = bet * 2;
      setBalance(balance => balance + winAmount);
      setMessage(`✨ Два символа! +${winAmount} монет`);
    } else {
      setMessage('😢 Попробуй ещё раз!');
    }
  };

  const reset = () => {
    setBalance(1000);
    setMessage('💰 Баланс пополнен!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md border-4 border-yellow-500 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-orange-500">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl text-white flex items-center gap-2">
              <Icon name="DollarSign" size={32} />
              Секретное Казино
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="text-2xl font-bold">💰 Баланс: {balance} монет</div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Выберите ставку:</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {BET_OPTIONS.map((betOption) => (
                  <Button
                    key={betOption}
                    size="sm"
                    variant={bet === betOption ? 'default' : 'outline'}
                    onClick={() => setBet(betOption)}
                    disabled={spinning || balance < betOption}
                    className={bet === betOption ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  >
                    {betOption}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 bg-gradient-to-b from-purple-600 to-purple-800 p-8 rounded-lg shadow-inner">
            {reels.map((symbol, i) => (
              <div 
                key={i}
                className={`text-7xl bg-white rounded-lg w-24 h-24 flex items-center justify-center shadow-lg ${spinning ? 'animate-spin' : ''}`}
              >
                {symbol}
              </div>
            ))}
          </div>

          {message && (
            <div className="text-center text-lg font-semibold animate-pulse">
              {message}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={spin} 
              disabled={spinning || balance < bet}
              className="w-full h-14 text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {spinning ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={24} />
                  Крутим...
                </>
              ) : (
                <>
                  <Icon name="Play" className="mr-2" size={24} />
                  Крутить ({bet} монет)
                </>
              )}
            </Button>
            
            {balance < 100 && (
              <Button 
                onClick={reset} 
                variant="outline"
                className="w-full"
              >
                <Icon name="RefreshCw" className="mr-2" size={18} />
                Пополнить баланс
              </Button>
            )}
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <div className="font-semibold">Коэффициенты выплат:</div>
            <div>💎💎💎 = ставка × 50 | 7️⃣7️⃣7️⃣ = ставка × 30</div>
            <div>Три одинаковых = ставка × 10 | Два одинаковых = ставка × 2</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};