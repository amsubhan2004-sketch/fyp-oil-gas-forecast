"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function WellBody() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.2, 32]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[3, 0.4, 3]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

export function Well3D() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Canvas camera={{ position: [2.5, 2.5, 3.5], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 3]} intensity={1} />
        <WellBody />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
