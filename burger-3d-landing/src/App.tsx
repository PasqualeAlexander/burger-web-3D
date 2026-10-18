import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Plus, Trash2, ShoppingCart, X, Check, GripVertical } from 'lucide-react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Burger } from './components/Burger'
import { INGREDIENT_DATA } from './types'
import type { Ingredient, IngredientType } from './types'

interface Order {
  id: string;
  ingredients: Ingredient[];
  price: number;
}

const freshId = () => Math.random().toString(36).substr(2, 9)

const makeDefaultIngredients = (): Ingredient[] => [
  { id: freshId(), type: 'patty' },
  { id: freshId(), type: 'cheese' },
  { id: freshId(), type: 'tomato' },
  { id: freshId(), type: 'lettuce' },
]

function SortableIngredient({ ing, removeIngredient }: { ing: Ingredient, removeIngredient: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: ing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const data = INGREDIENT_DATA[ing.type]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-3.5 bg-neutral-700/80 hover:bg-neutral-700 rounded-xl border border-neutral-600/60 shadow-sm transition-all duration-200 relative z-10 group"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-white p-1 -ml-1 transition-colors">
          <GripVertical size={20} />
        </div>
        <div className="w-4 h-4 rounded-full shadow-md ring-2 ring-neutral-800" style={{ backgroundColor: data.color }} />
        <span className="font-bold text-sm md:text-base text-neutral-100 tracking-tight">{data.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-amber-400 font-bold text-sm">+${data.price.toFixed(2)}</span>
        <button 
          onClick={() => removeIngredient(ing.id)}
          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Quitar ingrediente"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(makeDefaultIngredients)
  const [cart, setCart] = useState<Order[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [burgerKey, setBurgerKey] = useState(0)

  const addIngredient = (type: IngredientType) => {
    setIngredients((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), type }
    ])
  }

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setIngredients((items) => {
        const visualItems = [...items].reverse();
        const oldIndex = visualItems.findIndex((i) => i.id === active.id);
        const newIndex = visualItems.findIndex((i) => i.id === over.id);
        const newVisualItems = arrayMove(visualItems, oldIndex, newIndex);
        return newVisualItems.reverse();
      });
    }
  }

  const totalPrice = ingredients.reduce((sum, ing) => sum + INGREDIENT_DATA[ing.type].price, 5.0)

  const [isExploding, setIsExploding] = useState(false)

  const handleConfirmOrder = () => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      ingredients: [...ingredients],
      price: totalPrice
    }
    setCart((prev) => [...prev, newOrder])

    // Trigger explosion, then reset after animation finishes
    setIsExploding(true)
    setTimeout(() => {
      setIsExploding(false)
      setIngredients(makeDefaultIngredients())
      setBurgerKey(k => k + 1) // forces full remount of Burger → clean drop-in
    }, 900)

    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const cartTotal = cart.reduce((sum, order) => sum + order.price, 0)
  
  // UI list is rendered top-to-bottom, so we reverse the underlying bottom-to-top array
  const visualIngredients = [...ingredients].reverse();

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-neutral-900 text-white overflow-hidden font-sans">
      
      {/* 3D Canvas Area */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing min-h-[40vh] md:min-h-0">
        <Canvas shadows camera={{ position: [0, 2, 7], fov: 45 }}>
          <Environment preset="apartment" />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          
          <Burger key={burgerKey} ingredients={ingredients} isExploding={isExploding} />
          
          <ContactShadows position={[0, -0.7, 0]} opacity={0.7} scale={15} blur={2.5} far={4} color="#000000" />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 6} />
        </Canvas>
        
        {/* Title */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none z-10">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-amber-400 drop-shadow-lg">
            Pasquale Burger
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-medium">Diseña tu obra maestra (Arrastra para rotar)</p>
        </div>

        {/* Cart Button */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="text-amber-400" size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-neutral-900 font-black text-sm rounded-full flex items-center justify-center shadow-lg">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce z-20">
            <Check size={20} />
            ¡Hamburguesa agregada al carrito!
          </div>
        )}

        {/* Cart Modal Overlay */}
        {isCartOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-neutral-800 border border-neutral-700 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-neutral-700 flex justify-between items-center bg-neutral-800">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="text-amber-400" />
                  Tu Pedido
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-neutral-500 py-10">
                    Tu carrito está vacío. ¡Arma una hamburguesa!
                  </div>
                ) : (
                  cart.map((order, i) => (
                    <div key={order.id} className="bg-neutral-700/50 p-4 rounded-xl border border-neutral-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg text-amber-400">Hamburguesa #{i + 1}</span>
                        <span className="font-bold">${order.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        Pan, {order.ingredients.map(ing => INGREDIENT_DATA[ing.type].name).join(', ')}, Pan
                      </p>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-neutral-900 border-t border-neutral-700">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl text-neutral-400">Total a pagar:</span>
                    <span className="text-3xl font-black text-amber-400">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      alert('¡Redirigiendo a la pasarela de pago (Simulada)!')
                      setCart([])
                      setIsCartOpen(false)
                    }}
                    className="w-full py-4 bg-amber-500 text-neutral-900 font-black text-lg rounded-xl hover:bg-amber-400 active:scale-[0.98] transition-all"
                  >
                    Ir a Pagar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* UI Sidebar */}
      <div className="w-full md:w-[440px] lg:w-[460px] h-[65vh] md:h-full shrink-0 bg-neutral-850 shadow-2xl flex flex-col z-10 border-t md:border-t-0 md:border-l border-neutral-700">
        
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-neutral-700 bg-neutral-800">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Tu Hamburguesa</h2>
            <span className="text-2xl md:text-3xl font-black text-amber-400">${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Configura las capas y añade tus ingredientes favoritos</p>
        </div>

        {/* Current Stack - Capas de Ingredientes con mayor presencia y espacio */}
        <div className="flex-[1.6] md:flex-[1.8] overflow-y-auto p-4 md:p-5 space-y-2.5 min-h-0 bg-neutral-800/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-amber-400/90 flex items-center gap-2">
              <span>Capas Actuales</span>
              <span className="bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {ingredients.length}
              </span>
            </h3>
            <span className="text-[11px] text-neutral-400 font-medium">Arrastra para reordenar</span>
          </div>
          
          <div className="py-2.5 px-3.5 bg-amber-500/10 rounded-xl text-center text-xs font-bold text-amber-300 border border-amber-500/20 shadow-xs">
            🍞 Pan Superior con Sésamo
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visualIngredients.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5 my-2">
                {visualIngredients.map((ing) => (
                  <SortableIngredient key={ing.id} ing={ing} removeIngredient={removeIngredient} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="py-2.5 px-3.5 bg-amber-500/10 rounded-xl text-xs font-bold text-amber-300 border border-amber-500/20 shadow-xs flex justify-between items-center">
            <span>🍞 Pan Inferior (Base)</span>
            <span className="text-amber-400/90 font-bold">$5.00</span>
          </div>
        </div>

        {/* Add Ingredients - Extras balanceados */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-neutral-900 border-t border-neutral-700 min-h-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-400">
                + Agregar Extras
              </h3>
              <span className="text-[11px] text-neutral-500">Haz clic para añadir</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[160px] md:max-h-none pr-0.5">
              {(Object.entries(INGREDIENT_DATA) as [IngredientType, typeof INGREDIENT_DATA[IngredientType]][]).map(([type, data]) => (
                <button
                  key={type}
                  onClick={() => addIngredient(type)}
                  className="flex items-center justify-between p-2.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 hover:border-amber-500/40 rounded-xl transition-all duration-150 group active:scale-[0.97]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shadow-sm shrink-0 ring-1 ring-neutral-700" style={{ backgroundColor: data.color }} />
                    <span className="font-semibold text-xs text-neutral-300 group-hover:text-white truncate">{data.name}</span>
                  </div>
                  <Plus size={14} className="text-neutral-500 group-hover:text-amber-400 shrink-0 ml-1 transition-colors" />
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleConfirmOrder}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-extrabold text-base rounded-xl hover:brightness-105 active:scale-[0.98] shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            Agregar al Carrito • ${totalPrice.toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
