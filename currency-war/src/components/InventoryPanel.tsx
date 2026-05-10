import { useGameStore } from '../store/gameStore';
import { EQUIPMENTS } from '../data/equipment';

const InventoryPanel = () => {
  const inventory = useGameStore(state => state.player.inventory);
  const craftEquipment = useGameStore(state => state.craftEquipment);
  const addEquipment = useGameStore(state => state.addEquipment); // for testing

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'inventory', index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.source === 'inventory' && data.index !== targetIndex) {
        // Attempt Crafting
        const item1Id = inventory[data.index];
        const item2Id = inventory[targetIndex];
        
        // Find if any advanced equipment matches this recipe
        const advEquips = Object.values(EQUIPMENTS).filter(eq => eq.type === 'advanced' && eq.recipe);
        let craftedId = null;

        for (const eq of advEquips) {
          if (
            (eq.recipe![0] === item1Id && eq.recipe![1] === item2Id) ||
            (eq.recipe![0] === item2Id && eq.recipe![1] === item1Id)
          ) {
            craftedId = eq.id;
            break;
          }
        }

        if (craftedId) {
          craftEquipment(data.index, targetIndex, craftedId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="absolute left-0 bottom-4 w-[240px] glass-panel p-3 border-l-4 border-l-[var(--color-hsr-gold)] z-30">
      <div className="text-sm font-bold mb-2 flex justify-between items-center">
        <span>装备背包</span>
        {/* For testing, adding random basic items */}
        <button 
          className="text-xs text-[var(--color-hsr-gold)] cursor-pointer hover:underline"
          onClick={() => {
            const basics = ['basic_sword', 'basic_shield', 'basic_boots', 'basic_crystal'];
            addEquipment(basics[Math.floor(Math.random() * basics.length)]);
          }}
        >
          + 测试获取
        </button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[60px]">
        {inventory.map((itemId, i) => {
          const eq = EQUIPMENTS[itemId];
          return (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragOver={handleDragOver}
              className={`w-10 h-10 border flex items-center justify-center cursor-grab group relative ${
                eq?.type === 'advanced' ? 'border-[var(--color-hsr-gold)] shadow-[0_0_8px_rgba(225,201,124,0.5)]' : 'border-gray-500'
              } bg-black/40 hover:bg-black/60 transition-colors`}
            >
              <span className="text-xl">{eq?.icon}</span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 border border-[var(--color-hsr-cyan)] text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 rounded">
                <div className="font-bold text-[var(--color-hsr-gold)]">{eq?.name}</div>
                <div className="text-gray-300 mt-1">{eq?.description}</div>
              </div>
            </div>
          );
        })}
        {inventory.length === 0 && (
          <div className="w-full text-xs text-center text-gray-500 self-center">背包为空</div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
