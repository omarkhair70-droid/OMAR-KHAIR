"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { FirstContactPhase } from "./types";

type WorldProps = {
  phase: FirstContactPhase;
  aligned: boolean;
  signalProgress: number;
  signalCrossed: boolean;
  warm: boolean;
  reducedMotion: boolean;
};

const chalk = "#eee7dc";
const porcelain = "#f8f3eb";
const graphite = "#373331";
const rose = "#c98f89";
const clay = "#b86f58";
const coral = "#d37961";
const amber = "#d6a15e";
const wine = "#672f39";

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function Block({
  position,
  scale,
  rotation = [0, 0, 0],
  color = chalk,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox position={position} scale={scale} rotation={rotation} radius={0.08} smoothness={4}>
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.01} />
    </RoundedBox>
  );
}

function Node({ x, alive = false }: { x: number; alive?: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!core.current || !halo.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * (alive ? 1.8 : 0.7) + x) * (alive ? 0.06 : 0.016);
    core.current.scale.setScalar(pulse);
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.58 + x) * 0.08);
  });

  return (
    <group position={[x, 0.23, 0]}>
      <mesh ref={halo}>
        <sphereGeometry args={[0.28, 28, 28]} />
        <meshBasicMaterial
          color={alive ? coral : rose}
          transparent
          opacity={alive ? 0.11 : 0.035}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial
          color={alive ? wine : graphite}
          emissive={alive ? coral : "#000000"}
          emissiveIntensity={alive ? 0.16 : 0.01}
          roughness={0.58}
        />
      </mesh>
    </group>
  );
}

function ObjectArtifact({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.position.y = 0.28 + Math.sin(clock.elapsedTime * 0.55) * 0.025;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.26) * 0.012;
  });

  return (
    <group ref={ref} position={[0, 0.28, 0]} rotation={[0.06, -0.3, -0.025]}>
      <RoundedBox args={[2.02, 1.25, 0.12]} radius={0.14} smoothness={5}>
        <meshStandardMaterial color={porcelain} roughness={0.8} />
      </RoundedBox>
      <mesh position={[-0.58, 0.2, 0.068]}>
        <boxGeometry args={[0.68, 0.026, 0.01]} />
        <meshBasicMaterial color={graphite} />
      </mesh>
      <mesh position={[-0.73, 0.07, 0.069]}>
        <boxGeometry args={[0.34, 0.015, 0.01]} />
        <meshBasicMaterial color="#817873" />
      </mesh>
      <mesh position={[0.69, -0.38, 0.071]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.064, 0.095, 32]} />
        <meshBasicMaterial color={clay} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GapWorld() {
  return (
    <group>
      <Block position={[-1.43, -0.18, 0]} scale={[1.62, 1.14, 0.8]} rotation={[0, 0.08, 0]} color="#dfd7cb" />
      <Block position={[1.43, -0.18, 0]} scale={[1.62, 1.14, 0.8]} rotation={[0, -0.08, 0]} />
      <Node x={-1.16} />
      <Node x={1.16} />
    </group>
  );
}

function AngleWorld({ aligned, reducedMotion }: { aligned: boolean; reducedMotion: boolean }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!left.current || !right.current) return;

    const targetLeft = aligned ? -0.18 : -0.78;
    const targetRight = aligned ? 0.18 : 0.86;
    left.current.rotation.z = reducedMotion ? targetLeft : damp(left.current.rotation.z, targetLeft, 3.1, delta);
    right.current.rotation.z = reducedMotion ? targetRight : damp(right.current.rotation.z, targetRight, 3.1, delta);
    left.current.position.x = reducedMotion ? (aligned ? -0.28 : -0.72) : damp(left.current.position.x, aligned ? -0.28 : -0.72, 3.1, delta);
    right.current.position.x = reducedMotion ? (aligned ? 0.28 : 0.78) : damp(right.current.position.x, aligned ? 0.28 : 0.78, 3.1, delta);

    if (!reducedMotion) {
      const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.018;
      left.current.position.y = breathe;
      right.current.position.y = -breathe;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      <group ref={left}>
        <Block position={[0, 0, 0]} scale={[0.86, 0.19, 0.38]} color={aligned ? "#e4c6bd" : "#b7aea5"} />
        <Block position={[-0.34, 0.25, 0]} scale={[0.18, 0.7, 0.38]} color={aligned ? rose : "#9d958d"} />
      </group>
      <group ref={right}>
        <Block position={[0, 0, 0]} scale={[0.86, 0.19, 0.38]} color={aligned ? "#f1ddd5" : "#d4cdc4"} />
        <Block position={[0.34, -0.25, 0]} scale={[0.18, 0.7, 0.38]} color={aligned ? porcelain : chalk} />
      </group>
      <mesh position={[0, -0.6, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.345, 64]} />
        <meshBasicMaterial color={aligned ? coral : graphite} transparent opacity={aligned ? 0.62 : 0.10} />
      </mesh>
    </group>
  );
}

function SignalPacket({
  offset,
  progress,
  crossed,
}: {
  offset: number;
  progress: number;
  crossed: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const loop = (clock.elapsedTime * 0.18 + offset) % 1;
    const available = crossed ? 1 : Math.max(0.18, Math.min(0.58, progress * 0.64));
    const travel = Math.min(loop, available);
    ref.current.position.x = THREE.MathUtils.lerp(-1.04, 1.04, travel);
    ref.current.position.y = 0.25 + Math.sin(travel * Math.PI) * 0.16;
    const material = ref.current.material as THREE.MeshBasicMaterial;
    material.opacity = travel >= available && !crossed ? 0.12 : 0.78;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035 + offset * 0.02, 16, 16]} />
      <meshBasicMaterial color={offset > 0.4 ? amber : coral} transparent opacity={0.76} />
    </mesh>
  );
}

function SignalWorld({
  signalProgress,
  signalCrossed,
}: {
  signalProgress: number;
  signalCrossed: boolean;
}) {
  return (
    <group>
      <Node x={-1.3} alive />
      <Node x={1.3} alive={signalCrossed} />
      <mesh position={[0, 0.25, -0.02]}>
        <boxGeometry args={[2.25, 0.012, 0.012]} />
        <meshBasicMaterial color={signalCrossed ? coral : "#9f958e"} transparent opacity={signalCrossed ? 0.22 : 0.08} />
      </mesh>
      <SignalPacket offset={0.02} progress={signalProgress} crossed={signalCrossed} />
      <SignalPacket offset={0.34} progress={signalProgress} crossed={signalCrossed} />
      <SignalPacket offset={0.62} progress={signalProgress} crossed={signalCrossed} />
    </group>
  );
}

function Membrane({
  angle,
  tilt,
  color,
  scale = 1,
}: {
  angle: number;
  tilt: number;
  color: string;
  scale?: number;
}) {
  const shape = useMemo(() => {
    const next = new THREE.Shape();
    next.moveTo(0, 0);
    next.bezierCurveTo(0.14, 0.12, 0.31, 0.38, 0.08, 0.66);
    next.bezierCurveTo(-0.1, 0.42, -0.16, 0.16, 0, 0);
    return next;
  }, []);

  return (
    <mesh rotation={[tilt, angle, angle * 0.22]} scale={scale}>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.022,
            bevelEnabled: true,
            bevelSize: 0.012,
            bevelThickness: 0.008,
            bevelSegments: 3,
            curveSegments: 20,
          },
        ]}
      />
      <meshPhysicalMaterial
        color={color}
        roughness={0.72}
        transmission={0.04}
        thickness={0.28}
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ThirdThing({
  warm,
  residue,
  reducedMotion,
}: {
  warm: boolean;
  residue: boolean;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const target = residue ? 0.16 : 1;
    const next = reducedMotion ? target : damp(root.current.scale.x, target, 2.8, delta);
    root.current.scale.setScalar(next);

    if (!reducedMotion) {
      root.current.rotation.y += delta * (warm ? 0.045 : 0.018);
      root.current.position.y = 0.14 + Math.sin(clock.elapsedTime * 0.62) * 0.026;
    }
  });

  return (
    <group>
      {!residue ? <Node x={-1.34} alive={warm} /> : null}
      {!residue ? <Node x={1.34} alive={warm} /> : null}
      <group ref={root} scale={residue ? 0.16 : 0.22} position={[0, 0.14, 0]}>
        <Membrane angle={0} tilt={0.18} color="#f6e7e0" scale={1.05} />
        <Membrane angle={1.18} tilt={0.54} color="#e7bbb2" scale={0.91} />
        <Membrane angle={2.38} tilt={-0.42} color="#f0d1c9" scale={0.88} />
        <Membrane angle={3.62} tilt={0.72} color="#d79589" scale={0.76} />
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.13, 28, 28]} />
          <meshStandardMaterial
            color={amber}
            emissive={coral}
            emissiveIntensity={warm ? 0.40 : 0.08}
            roughness={0.44}
          />
        </mesh>
      </group>
      {residue ? (
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, -0.17]}>
          <boxGeometry args={[1.6, 0.026, 0.026]} />
          <meshBasicMaterial color={coral} transparent opacity={0.78} />
        </mesh>
      ) : null}
    </group>
  );
}

function World(props: WorldProps) {
  const root = useRef<THREE.Group>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const narrow = viewportWidth < 3.5;

  useFrame((state, delta) => {
    if (!root.current) return;

    if (!props.reducedMotion) {
      root.current.rotation.y = damp(root.current.rotation.y, state.pointer.x * (narrow ? 0.018 : 0.045), 3.2, delta);
      root.current.rotation.x = damp(root.current.rotation.x, -state.pointer.y * (narrow ? 0.008 : 0.018), 3.2, delta);
    }
  });

  return (
    <group ref={root} scale={narrow ? 0.66 : 1} position={[0, narrow ? 0.18 : -0.05, 0]}>
      {props.phase === "object" ? <ObjectArtifact reducedMotion={props.reducedMotion} /> : null}
      {props.phase === "gap" ? <GapWorld /> : null}
      {props.phase === "angle" ? <AngleWorld aligned={props.aligned} reducedMotion={props.reducedMotion} /> : null}
      {props.phase === "signal" ? (
        <SignalWorld signalProgress={props.signalProgress} signalCrossed={props.signalCrossed} />
      ) : null}
      {props.phase === "third" || props.phase === "residue" ? (
        <ThirdThing
          warm={props.warm}
          residue={props.phase === "residue"}
          reducedMotion={props.reducedMotion}
        />
      ) : null}
      <mesh position={[0, -1.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={props.warm ? "#eee0d7" : "#e8e2d8"} roughness={1} />
      </mesh>
      <ContactShadows position={[0, -1, 0]} opacity={props.warm ? 0.26 : 0.18} scale={8} blur={3.8} far={4} />
    </group>
  );
}

export default function FirstContactCanvas(props: WorldProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.05, 5.3], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.45} />
      <directionalLight position={[3.5, 6, 5]} intensity={2.1} color="#fff6ee" />
      <directionalLight position={[-4, 2, 2]} intensity={0.65} color="#d9c7bd" />
      <World {...props} />
    </Canvas>
  );
}
