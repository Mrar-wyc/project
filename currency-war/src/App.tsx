import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import ShopPanel from './components/ShopPanel';
import BenchPanel from './components/BenchPanel';
import BattleBoard from './components/BattleBoard';
import InfoPanel from './components/InfoPanel';

function App() {
  // Generate random particles for the background
  const [particles, setParticles] = useState<{id: number, top: string, left: string, size: string, duration: string, delay: string}[]>([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100 + 100}%`, // Start off-screen right
        size: `${Math.random() * 3 + 1}px`,
        duration: `${Math.random() * 20 + 10}s`,
        delay: `${Math.random() * -20}s`,
      });
    }
    setParticles(arr);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-[var(--color-hsr-bg)] text-[var(--color-hsr-text)]">
      {/* 动态深空星云背景 */}
      <div className="space-bg" />
      {particles.map(p => (
        <div 
          key={p.id} 
          className="star-particle" 
          style={{
            top: p.top, 
            left: p.left, 
            width: p.size, 
            height: p.size, 
            animationDuration: `${p.duration}, ${Math.random() * 2 + 1}s`,
            animationDelay: `${p.delay}, ${Math.random() * 2}s`
          }} 
        />
      ))}
      
      {/* 局内状态栏 */}
      <TopBar />

      {/* 核心布局结构 */}
      <div className="flex-1 flex relative z-10 w-full h-full pt-16 pb-32 px-8 gap-6">
        
        {/* 左侧：中央战斗区 */}
        <div className="flex-1 h-full relative">
          <BattleBoard />
        </div>

        {/* 右侧：羁绊与商店面板层叠 */}
        <div className="w-[320px] h-full flex flex-col gap-4">
          <InfoPanel />
          <ShopPanel />
        </div>
      </div>

      {/* 底部悬浮透明玻璃条 (备战席 + 商店操作) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-20">
        <BenchPanel />
      </div>
    </div>
  );
}

export default App;