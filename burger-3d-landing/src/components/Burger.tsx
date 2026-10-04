import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { INGREDIENT_DATA } from '../types'
import type { Ingredient } from '../types'


interface BurgerProps {
  ingredients: Ingredient[];
}

const AnimatedIngredient = ({ 
  type, 
  targetY, 
  geometryType 
}: { 
  type: string; 
  targetY: number; 
  geometryType: 'cylinder' | 'box' 
}) => {
  const meshRef = useRef<any>(null)
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

  const materialProps = {
    color: data.color,
    roughness: data.roughness,
    metalness: data.metalness,
    clearcoat: data.clearcoat || 0,
    clearcoatRoughness: 0.1,
    transmission: data.transmission || 0,
    thickness: data.thickness || 0,
    ior: data.ior || 1.5,
  }

  if (geometryType === 'box') {
    return (
      <RoundedBox ref={meshRef} args={[2.2, data.height, 2.2]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial {...materialProps} />
      </RoundedBox>
    )
  }

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, data.height, 64]} />
      <meshPhysicalMaterial {...materialProps} />
    </mesh>
  )
}

export const Burger = ({ ingredients }: BurgerProps) => {
  const group = useRef<THREE.Group>(null)

  // Calculate cumulative heights for each ingredient
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
      group.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group ref={group}>
      {/* Bottom Bun */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.4, 64]} />
        <meshPhysicalMaterial color="#c27a3c" roughness={0.8} clearcoat={0.1} />
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
    <mesh ref={meshRef} position={[0, 5, 0]} castShadow receiveShadow>
      <sphereGeometry args={[1.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#c27a3c" roughness={0.8} clearcoat={0.1} />
    </mesh>
  )
}
