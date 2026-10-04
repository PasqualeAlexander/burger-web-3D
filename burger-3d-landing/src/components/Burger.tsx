import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { INGREDIENT_DATA } from '../types'
import type { Ingredient } from '../types'


interface BurgerProps {
  ingredients: Ingredient[];
}

// A single ingredient that animates to its target Y position
const AnimatedIngredient = ({ 
  type, 
  targetY, 
  geometryType 
}: { 
  type: string; 
  targetY: number; 
  geometryType: 'cylinder' | 'box' 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const data = INGREDIENT_DATA[type as keyof typeof INGREDIENT_DATA]

  // Start a bit higher so it "drops" in
  useMemo(() => {
    if (meshRef.current) {
      meshRef.current.position.y = targetY + 3
    }
  }, [targetY])

  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Lerp to the target position
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 10
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      {geometryType === 'cylinder' ? (
        <cylinderGeometry args={[1.5, 1.5, data.height, 32]} />
      ) : (
        <boxGeometry args={[2.2, data.height, 2.2]} />
      )}
      <meshStandardMaterial color={data.color} roughness={0.8} />
    </mesh>
  )
}

export const Burger = ({ ingredients }: BurgerProps) => {
  const group = useRef<THREE.Group>(null)

  // Calculate cumulative heights for each ingredient
  // Bottom bun base Y
  let currentY = -0.5
  
  const bottomBunHeight = 0.4
  currentY += bottomBunHeight / 2 // center of bottom bun

  const placedIngredients = ingredients.map((ing) => {
    const data = INGREDIENT_DATA[ing.type]
    const targetY = currentY + (data.height / 2)
    currentY += data.height
    
    // determine shape based on type just for variety
    const isBox = ing.type === 'cheese' || ing.type === 'bacon'
    
    return {
      ...ing,
      targetY,
      geometryType: isBox ? 'box' : 'cylinder' as 'box' | 'cylinder'
    }
  })

  // Top bun target Y
  const topBunTargetY = currentY + 0.25

  useFrame((state) => {
    if (group.current) {
      // slowly rotate the entire burger
      group.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={group}>
      {/* Bottom Bun */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
        <meshStandardMaterial color="#E2A76F" roughness={0.6} />
      </mesh>
      
      {/* Dynamic Ingredients */}
      {placedIngredients.map((ing) => (
        <AnimatedIngredient 
          key={ing.id} 
          type={ing.type} 
          targetY={ing.targetY} 
          geometryType={ing.geometryType} 
        />
      ))}

      {/* Top Bun */}
      <AnimatedIngredientBunTop targetY={topBunTargetY} />
    </group>
  )
}

// Special component for the top bun since it has a sphere geometry
const AnimatedIngredientBunTop = ({ targetY }: { targetY: number }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 10
      )
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 5, 0]}>
      <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#E2A76F" roughness={0.6} />
    </mesh>
  )
}
