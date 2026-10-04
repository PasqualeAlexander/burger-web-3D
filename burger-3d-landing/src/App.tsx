import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Plus, Trash2 } from 'lucide-react'
import { Burger } from './components/Burger'
import { INGREDIENT_DATA } from './types'
import type { Ingredient, IngredientType } from './types'


function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', type: 'patty' },
    { id: '2', type: 'cheese' },
    { id: '3', type: 'tomato' },
    { id: '4', type: 'lettuce' }
  ])

  const addIngredient = (type: IngredientType) => {
    setIngredients((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), type }
    ])
  }

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  const totalPrice = ingredients.reduce((sum, ing) => sum + INGREDIENT_DATA[ing.type].price, 5.0) // 5.0 base price (buns)

  return (
    <div className="flex w-full h-screen bg-neutral-900 text-white overflow-hidden font-sans">
      
      {/* 3D Canvas Area */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          
          <Burger ingredients={ingredients} />
          
          <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={10} blur={2} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 6} />
        </Canvas>
        
        <div className="absolute top-6 left-6 pointer-events-none">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-amber-400 drop-shadow-lg">
            Burger Builder
          </h1>
          <p className="text-neutral-400 font-medium">Diseña tu obra maestra (Arrastra para rotar)</p>
        </div>
      </div>

      {/* UI Sidebar */}
      <div className="w-[400px] bg-neutral-800 shadow-2xl flex flex-col z-10 border-l border-neutral-700">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-700 bg-neutral-800">
          <h2 className="text-2xl font-bold">Tu Selección</h2>
          <div className="flex justify-between items-center mt-2">
            <span className="text-neutral-400">Total:</span>
            <span className="text-3xl font-black text-amber-400">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Current Stack */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase text-neutral-500 mb-4">Ingredientes ({ingredients.length})</h3>
          
          <div className="p-3 bg-neutral-700/30 rounded-lg text-center text-sm font-medium text-neutral-400 border border-neutral-700/50">
            Pan Superior
          </div>

          {[...ingredients].reverse().map((ing) => {
            const data = INGREDIENT_DATA[ing.type]
            return (
              <div key={ing.id} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg border border-neutral-600">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.color }} />
                  <span className="font-semibold">{data.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-amber-400 font-medium">+${data.price.toFixed(2)}</span>
                  <button 
                    onClick={() => removeIngredient(ing.id)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}

          <div className="p-3 bg-neutral-700/30 rounded-lg text-center text-sm font-medium text-neutral-400 border border-neutral-700/50">
            Pan Inferior ($5.00)
          </div>
        </div>

        {/* Add Ingredients */}
        <div className="p-6 bg-neutral-900 border-t border-neutral-700">
          <h3 className="text-sm font-semibold uppercase text-neutral-500 mb-4">Agregar</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(INGREDIENT_DATA) as [IngredientType, typeof INGREDIENT_DATA[IngredientType]][]).map(([type, data]) => (
              <button
                key={type}
                onClick={() => addIngredient(type)}
                className="flex items-center justify-between p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                  <span className="font-medium text-sm text-neutral-300 group-hover:text-white">{data.name}</span>
                </div>
                <Plus size={16} className="text-neutral-500 group-hover:text-amber-400" />
              </button>
            ))}
          </div>
          
          <button className="w-full mt-6 py-4 bg-amber-500 text-neutral-900 font-black text-lg rounded-xl hover:bg-amber-400 active:scale-[0.98] transition-all">
            Confirmar Pedido
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
