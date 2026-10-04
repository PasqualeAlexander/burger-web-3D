import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { INGREDIENT_DATA } from '../types'
import type { Ingredient } from '../types'

interface BurgerProps {
  ingredients: Ingredient[];
  isExploding: boolean;
}


const AnimatedIngredient = ({
  type,
  targetY,
  geometryType,
  isExploding,
  explosionVelocity,
}: {
  type: string;
  targetY: number;
  geometryType: 'cylinder' | 'box';
  isExploding: boolean;
  explosionVelocity: THREE.Vector3;
}) => {
  const meshRef = useRef<any>(null)
  const data = INGREDIENT_DATA[type as keyof typeof INGREDIENT_DATA]
  const explodeElapsed = useRef(0)
  const exploding = useRef(false)

  useMemo(() => {
    if (meshRef.current) {
      meshRef.current.position.y = targetY + 3
    }
  }, [targetY])

  useFrame((_state, delta) => {
    if (!meshRef.current) return

    if (isExploding) {
      exploding.current = true
      explodeElapsed.current += delta
      // fly outward
      meshRef.current.position.x += explosionVelocity.x * delta * 5
      meshRef.current.position.y += explosionVelocity.y * delta * 5 - 5 * delta * explodeElapsed.current
      meshRef.current.position.z += explosionVelocity.z * delta * 5
      meshRef.current.rotation.x += delta * 8
      meshRef.current.rotation.z += delta * 6
      // fade out
      if (meshRef.current.material) {
        const mat = Array.isArray(meshRef.current.material)
          ? meshRef.current.material[0]
          : meshRef.current.material
        mat.opacity = Math.max(0, 1 - explodeElapsed.current * 2)
        mat.transparent = true
      }
    } else {
      // reset on return to default
      exploding.current = false
      explodeElapsed.current = 0
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 10
      )
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, delta * 10)
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, delta * 10)
      if (meshRef.current.material) {
        const mat = Array.isArray(meshRef.current.material)
          ? meshRef.current.material[0]
          : meshRef.current.material
        mat.opacity = 1
        mat.transparent = false
      }
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

  let radius = 1.5
  if (['ketchup', 'mustard', 'mayo'].includes(type)) radius = 1.25
  if (['onion', 'pickle'].includes(type)) radius = 1.4

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, data.height, 64]} />
      <meshPhysicalMaterial {...materialProps} />
    </mesh>
  )
}

// Top bun with explosion support
const AnimatedIngredientBunTop = ({ targetY, isExploding }: { targetY: number; isExploding: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const explodeElapsed = useRef(0)
  const velocity = useMemo(() => new THREE.Vector3(0, 3, 0), [])

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    if (isExploding) {
      explodeElapsed.current += delta
      meshRef.current.position.x += velocity.x * delta * 5
      meshRef.current.position.y += velocity.y * delta * 5 - 5 * delta * explodeElapsed.current
      meshRef.current.position.z += velocity.z * delta * 5
      meshRef.current.rotation.z += delta * 4
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = Math.max(0, 1 - explodeElapsed.current * 2)
      mat.transparent = true
    } else {
      explodeElapsed.current = 0
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 10)
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, delta * 10)
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, delta * 10)
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = 1
      mat.transparent = false
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 5, 0]} castShadow receiveShadow>
      <sphereGeometry args={[1.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#c27a3c" roughness={0.8} clearcoat={0.1} />
    </mesh>
  )
}

// Bottom bun with explosion support
const AnimatedBottomBun = ({ isExploding }: { isExploding: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const explodeElapsed = useRef(0)
  const velocity = useMemo(() => new THREE.Vector3(0, -3, 0), [])

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    if (isExploding) {
      explodeElapsed.current += delta
      meshRef.current.position.x += velocity.x * delta * 5
      meshRef.current.position.y += velocity.y * delta * 5 + 5 * delta * explodeElapsed.current
      meshRef.current.position.z += velocity.z * delta * 5
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = Math.max(0, 1 - explodeElapsed.current * 2)
      mat.transparent = true
    } else {
      explodeElapsed.current = 0
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, -0.5, delta * 10)
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, delta * 10)
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, delta * 10)
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = 1
      mat.transparent = false
    }
  })

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.4, 64]} />
      <meshPhysicalMaterial color="#c27a3c" roughness={0.8} clearcoat={0.1} />
    </mesh>
  )
}

export const Burger = ({ ingredients, isExploding }: BurgerProps) => {
  const group = useRef<THREE.Group>(null)

  let currentY = -0.5
  const bottomBunHeight = 0.4
  currentY += bottomBunHeight / 2

  // Generate stable explosion velocities per ingredient using index
  const explosionVelocities = useMemo(() => {
    return ingredients.map((_, i) => {
      const angle = (i / Math.max(ingredients.length, 1)) * Math.PI * 2 + i * 0.7
      return new THREE.Vector3(
        Math.cos(angle) * (1.5 + Math.random() * 1.5),
        1 + Math.random() * 2,
        Math.sin(angle) * (1.5 + Math.random() * 1.5),
      )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients.length])

  const placedIngredients = ingredients.map((ing, i) => {
    const data = INGREDIENT_DATA[ing.type]
    const targetY = currentY + (data.height / 2)
    currentY += data.height
    const isBox = ing.type === 'cheese' || ing.type === 'bacon'
    return {
      ...ing,
      targetY,
      geometryType: isBox ? 'box' : 'cylinder' as 'box' | 'cylinder',
      velocity: explosionVelocities[i] ?? new THREE.Vector3(1, 1, 1),
    }
  })

  const topBunTargetY = currentY + 0.25

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group ref={group}>
      <AnimatedBottomBun isExploding={isExploding} />

      {placedIngredients.map((ing) => (
        <AnimatedIngredient
          key={ing.id}
          type={ing.type}
          targetY={ing.targetY}
          geometryType={ing.geometryType}
          isExploding={isExploding}
          explosionVelocity={ing.velocity}
        />
      ))}

      <AnimatedIngredientBunTop targetY={topBunTargetY} isExploding={isExploding} />
    </group>
  )
}
