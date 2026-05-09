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
    <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-[var(--color-hsr-bg)] text-[var(--color-hsr-text)]" style={{ height: '100vh', maxHeight: '100vh' }}>
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
      <div className="flex-1 flex flex-col relative z-10 w-full h-full pt-20 px-8 gap-6 pb-6 overflow-hidden">
        
        <div className="flex flex-1 gap-6 min-h-0">
          {/* 左侧：中央战斗区 */}
          <div className="flex-1 flex flex-col relative h-full">
            <div className="flex-1 relative min-h-0">
              <BattleBoard />
            </div>
            
            {/* 底部备战席 */}
            <div className="mt-auto shrink-0 z-20">
              <BenchPanel />
            </div>
          </div>

          {/* 右侧：羁绊与商店面板层叠 */}
          <div className="w-[320px] flex flex-col gap-4 h-full min-h-0 shrink-0">
            <div className="h-[55%] min-h-0 shrink-0 flex flex-col">
              <InfoPanel />
            </div>
            <div className="h-[45%] min-h-0 shrink-0 flex flex-col">
              <ShopPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;