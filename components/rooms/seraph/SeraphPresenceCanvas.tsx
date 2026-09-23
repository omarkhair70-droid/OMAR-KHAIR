"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  resetSeraphPerformance,
  updateSeraphPerformance,
} from "./seraph-performance";
import type { SeraphPerformanceSnapshot, SeraphPhase } from "./types";

const MODEL_URL =
  "https://raw.githubusercontent.com/omarkhair70-droid/seraph/cb28f15ea0208338f933840c082a94a7269e28dc/public/assets/serara-canonical.glb";

const TARGET_HEIGHT = 3.72;

type Rig = {
  hips?: THREE.Bone;
  spine?: THREE.Bone;
  spine1?: THREE.Bone;
  spine2?: THREE.Bone;
  neck?: THREE.Bone;
  head?: THREE.Bone;
  leftShoulder?: THREE.Bone;
  rightShoulder?: THREE.Bone;
  leftArm?: THREE.Bone;
  rightArm?: THREE.Bone;
  leftForeArm?: THREE.Bone;
  rightForeArm?: THREE.Bone;
  leftHand?: THREE.Bone;
  rightHand?: THREE.Bone;
};

type BoneKey = keyof Rig;

type BindPose = Partial<Record<BoneKey, THREE.Quaternion>>;

type FittedBody = {
  scene: THREE.Object3D;
  scale: number;
  offset: THREE.Vector3;
  rig: Rig;
  bind: BindPose;
  morphMeshes: THREE.Mesh[];
  porcelain: THREE.MeshPhysicalMaterial[];
  inner: THREE.MeshPhysicalMaterial[];
  eyes: THREE.MeshPhysicalMaterial[];
  signal: THREE.MeshPhysicalMaterial[];
};

const BONE_NAMES: Record<BoneKey, string> = {
  hips: "Hips",
  spine: "Spine",
  spine1: "Spine1",
  spine2: "Spine2",
  neck: "Neck",
  head: "Head",
  leftShoulder: "LeftShoulder",
  rightShoulder: "RightShoulder",
  leftArm: "LeftArm",
  rightArm: "RightArm",
  leftForeArm: "LeftForeArm",
  rightForeArm: "RightForeArm",
  leftHand: "LeftHand",
  rightHand: "RightHand",
};

const TENSION_OFFSETS: Partial<Record<BoneKey, [number, number, number]>> = {
  hips: [0.02, 0, -0.03],
  spine: [0.04, 0.01, -0.05],
  spine1: [0.06, -0.01, -0.06],
  spine2: [0.05, 0.01, -0.08],
  neck: [-0.02, 0.03, 0.04],
  head: [0.02, -0.03, 0.055],
  leftShoulder: [0.04, 0.03, 0.1],
  rightShoulder: [-0.02, -0.02, -0.07],
  leftArm: [0.04, 0.01, 0.06],
  rightArm: [-0.025, 0, -0.045],
  leftForeArm: [0.04, 0, 0.035],
  rightForeArm: [0.02, 0, -0.025],
};

const FALL_OFFSETS: Partial<Record<BoneKey, [number, number, number]>> = {
  hips: [0.12, 0.025, -0.07],
  spine: [0.14, 0, -0.05],
  spine1: [0.17, 0.015, -0.06],
  spine2: [0.19, -0.02, -0.085],
  neck: [0.15, 0.03, 0.045],
  head: [0.17, -0.03, 0.075],
  leftShoulder: [0.07, 0.03, 0.13],
  rightShoulder: [0.05, -0.025, -0.11],
  leftArm: [0.06, 0.015, 0.08],
  rightArm: [0.045, -0.01, -0.065],
  leftForeArm: [0.1, 0, 0.055],
  rightForeArm: [0.08, 0, -0.045],
};

function phaseWeights(state: SeraphPerformanceSnapshot) {
  const attune =
    state.phase === "attune"
      ? Math.max(0.25, state.recognition)
      : state.phase === "reform"
        ? Math.min(0.8, state.phaseAge / 4.5)
        : state.phase === "notice"
          ? state.recognition * 0.3
          : 0;

  const tension =
    state.phase === "strain"
      ? Math.max(0.2, state.strain)
      : state.phase === "fracture"
        ? 1
        : state.phase === "aftermath"
          ? 0.68
          : state.phase === "reform"
            ? Math.max(0, 0.5 - state.phaseAge / 7)
            : state.strain * 0.35;

  const fall =
    state.phase === "fracture"
      ? state.fracture
      : state.phase === "aftermath"
        ? 1
        : state.phase === "reform"
          ? Math.max(0, 1 - state.phaseAge / 4.2)
          : 0;

  return { attune, tension, fall };
}

function materialForSource(source: THREE.Material, fitted: FittedBody) {
  const name = source.name;

  if (name === "SERARA_Porcelain") {
    const material = new THREE.MeshPhysicalMaterial({
      name,
      color: "#d8d0c5",
      roughness: 0.48,
      metalness: 0.02,
      clearcoat: 0.12,
      clearcoatRoughness: 0.74,
      emissive: "#5e3428",
      emissiveIntensity: 0.018,
    });
    fitted.porcelain.push(material);
    return material;
  }

  if (name === "SERARA_InnerMineral" || name === "SERARA_CavityRim") {
    const material = new THREE.MeshPhysicalMaterial({
      name,
      color: name === "SERARA_InnerMineral" ? "#241615" : "#36221f",
      roughness: 0.68,
      metalness: 0.02,
      emissive: "#713527",
      emissiveIntensity: 0.055,
    });
    fitted.inner.push(material);
    return material;
  }

  if (name === "SERARA_EyeObsidian") {
    const material = new THREE.MeshPhysicalMaterial({
      name,
      color: "#100807",
      roughness: 0.16,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
      emissive: "#c66d42",
      emissiveIntensity: 0.34,
    });
    fitted.eyes.push(material);
    return material;
  }

  if (name === "SERARA_InternalSignal") {
    const material = new THREE.MeshPhysicalMaterial({
      name,
      color: "#7c3d27",
      roughness: 0.3,
      emissive: "#ef8b4a",
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    });
    fitted.signal.push(material);
    return material;
  }

  return source.clone();
}

function prepareBody(source: THREE.Object3D): FittedBody {
  const scene = clone(source);
  const fitted: FittedBody = {
    scene,
    scale: 1,
    offset: new THREE.Vector3(),
    rig: {},
    bind: {},
    morphMeshes: [],
    porcelain: [],
    inner: [],
    eyes: [],
    signal: [],
  };

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;

      if (object.morphTargetDictionary && object.morphTargetInfluences) {
        fitted.morphMeshes.push(object);
      }

      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) =>
          materialForSource(material, fitted),
        );
      } else if (object.material) {
        object.material = materialForSource(object.material, fitted);
      }
    }

    if (object instanceof THREE.Bone) {
      const key = (Object.keys(BONE_NAMES) as BoneKey[]).find(
        (candidate) => BONE_NAMES[candidate] === object.name,
      );
      if (key) {
        fitted.rig[key] = object;
        fitted.bind[key] = object.quaternion.clone();
      }
    }
  });

  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  fitted.scale = TARGET_HEIGHT / Math.max(0.001, size.y);
  fitted.offset.copy(center).multiplyScalar(-1);

  return fitted;
}

function setMorph(
  mesh: THREE.Mesh,
  name: string,
  value: number,
  alpha: number,
) {
  const dictionary = mesh.morphTargetDictionary;
  const influences = mesh.morphTargetInfluences;
  if (!dictionary || !influences) return;
  const index = dictionary[name];
  if (index === undefined) return;
  influences[index] = THREE.MathUtils.lerp(influences[index] ?? 0, value, alpha);
}

function applyRigPose(
  fitted: FittedBody,
  state: SeraphPerformanceSnapshot,
  delta: number,
  reducedMotion: boolean,
) {
  const { attune, tension, fall } = phaseWeights(state);
  const alpha = reducedMotion ? 1 : Math.min(1, delta * 2.7);

  for (const key of Object.keys(BONE_NAMES) as BoneKey[]) {
    const bone = fitted.rig[key];
    const bind = fitted.bind[key];
    if (!bone || !bind) continue;

    const tensionOffset = TENSION_OFFSETS[key] ?? [0, 0, 0];
    const fallOffset = FALL_OFFSETS[key] ?? [0, 0, 0];

    const euler = new THREE.Euler(
      tensionOffset[0] * tension + fallOffset[0] * fall,
      tensionOffset[1] * tension + fallOffset[1] * fall,
      tensionOffset[2] * tension + fallOffset[2] * fall,
    );

    if (key === "leftShoulder") euler.z -= attune * 0.06;
    if (key === "rightShoulder") euler.z += attune * 0.06;
    if (key === "spine2") euler.x -= attune * 0.045;
    if (key === "head") {
      euler.y += state.attentionX * (0.045 + state.recognition * 0.075);
      euler.x -= state.attentionY * (0.02 + state.recognition * 0.035);
    }

    const target = bind.clone().multiply(
      new THREE.Quaternion().setFromEuler(euler),
    );
    bone.quaternion.slerp(target, alpha);
  }

  for (const mesh of fitted.morphMeshes) {
    setMorph(
      mesh,
      "FACE_RELAXED",
      THREE.MathUtils.clamp(attune * 0.34 + state.recognition * 0.09, 0, 0.42),
      alpha,
    );
    setMorph(
      mesh,
      "FACE_TENSION",
      THREE.MathUtils.clamp(tension * 0.76, 0, 0.82),
      alpha,
    );
    setMorph(mesh, "FACE_FALL", THREE.MathUtils.clamp(fall * 0.8, 0, 0.82), alpha);
    setMorph(
      mesh,
      "EYES_NARROW",
      THREE.MathUtils.clamp(tension * 0.36 + fall * 0.62 - attune * 0.06, 0, 0.86),
      alpha,
    );
    setMorph(
      mesh,
      "MOUTH_SEAM_OPEN",
      THREE.MathUtils.clamp(tension * 0.04 + fall * 0.13, 0, 0.17),
      alpha,
    );
  }

  const heat = THREE.MathUtils.clamp(
    tension * 0.58 + fall * 0.8 + state.fracture * 0.85 + state.residue * 0.22,
    0,
    1,
  );

  for (const material of fitted.porcelain) {
    material.roughness = THREE.MathUtils.lerp(0.42, 0.62, heat);
    material.emissiveIntensity = 0.016 + heat * 0.06 + attune * 0.014;
  }

  for (const material of fitted.inner) {
    material.emissiveIntensity = 0.045 + heat * 0.2;
    material.emissive.set("#713527").lerp(new THREE.Color("#df5a31"), heat);
  }

  for (const material of fitted.eyes) {
    material.emissiveIntensity =
      0.28 + state.presence * 0.26 + state.recognition * 0.15 + heat * 0.18;
  }

  for (const material of fitted.signal) {
    material.emissiveIntensity = 0.5 + heat * 1.1 + attune * 0.22;
    material.opacity = 0.58 + heat * 0.24;
  }
}

function Fragments({
  state,
  reducedMotion,
}: {
  state: SeraphPerformanceSnapshot;
  reducedMotion: boolean;
}) {
  const fragments = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const theta = index * 2.399963229728653;
        const radius = 0.62 + ((index * 37) % 11) * 0.075;
        return {
          position: new THREE.Vector3(
            Math.cos(theta) * radius,
            -0.4 + ((index * 23) % 17) * 0.12,
            Math.sin(theta) * radius * 0.62,
          ),
          rotation: new THREE.Euler(theta * 0.23, theta, theta * 0.41),
          scale: 0.035 + ((index * 13) % 7) * 0.009,
          phase: index * 0.7,
        };
      }),
    [],
  );

  const group = useRef<THREE.Group>(null);
  const intensity =
    state.phase === "fracture"
      ? state.fracture
      : state.phase === "aftermath"
        ? 0.78
        : state.phase === "reform"
          ? Math.max(0, 0.62 - state.phaseAge * 0.11)
          : 0;

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.05;
  });

  if (intensity <= 0.01) return null;

  return (
    <group ref={group}>
      {fragments.map((fragment, index) => (
        <mesh
          key={index}
          position={[
            fragment.position.x * (0.7 + intensity * 0.85),
            fragment.position.y + intensity * 0.35,
            fragment.position.z,
          ]}
          rotation={fragment.rotation}
          scale={fragment.scale * (0.6 + intensity)}
        >
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={index % 4 === 0 ? "#9a3f2d" : "#4f332e"}
            emissive={index % 4 === 0 ? "#d85f38" : "#7b382b"}
            emissiveIntensity={0.14 + intensity * 0.35}
            roughness={0.74}
            transparent
            opacity={0.22 + intensity * 0.58}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  reducedMotion,
  impulseVersion,
  keyboardPresence,
  onPerformance,
}: {
  reducedMotion: boolean;
  impulseVersion: number;
  keyboardPresence: boolean;
  onPerformance: (state: SeraphPerformanceSnapshot) => void;
}) {
  const gltf = useGLTF(MODEL_URL);
  const fitted = useMemo(() => prepareBody(gltf.scene), [gltf.scene]);
  const motion = useRef<THREE.Group>(null);
  const lastPointer = useRef(new THREE.Vector2());
  const movement = useRef(0);
  const touchImpulse = useRef(0);
  const lastImpulseVersion = useRef(impulseVersion);
  const lastReported = useRef("");
  const lastReportAt = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    resetSeraphPerformance(0);
  }, []);

  useEffect(() => {
    if (impulseVersion === lastImpulseVersion.current) return;
    lastImpulseVersion.current = impulseVersion;
    touchImpulse.current = Math.min(1, touchImpulse.current + 0.58);
  }, [impulseVersion]);

  useFrame((frame, delta) => {
    const pointer = frame.pointer;
    const dx = pointer.x - lastPointer.current.x;
    const dy = pointer.y - lastPointer.current.y;
    lastPointer.current.set(pointer.x, pointer.y);

    const pointerSpeed = Math.min(1, Math.hypot(dx, dy) * 22);
    movement.current = THREE.MathUtils.damp(
      movement.current,
      pointerSpeed,
      pointerSpeed > movement.current ? 10 : 2.4,
      delta,
    );

    touchImpulse.current = THREE.MathUtils.damp(
      touchImpulse.current,
      0,
      2.2,
      delta,
    );

    const pointerDistance = Math.hypot(pointer.x * 0.82, pointer.y * 0.72);
    const proximity = THREE.MathUtils.clamp(1 - pointerDistance / 1.08, 0, 1);
    const presence = THREE.MathUtils.clamp(
      0.16 + proximity * 0.56 + (keyboardPresence ? 0.18 : 0) + touchImpulse.current * 0.15,
      0,
      1,
    );

    const performance = updateSeraphPerformance(
      {
        now: frame.clock.elapsedTime,
        presence,
        movement: movement.current,
        touchImpulse: touchImpulse.current,
        attentionX: pointer.x,
        attentionY: pointer.y,
      },
      delta,
    );

    applyRigPose(fitted, performance, delta, reducedMotion);

    if (motion.current) {
      const { attune, tension, fall } = phaseWeights(performance);
      const breath = reducedMotion ? 0 : Math.sin(frame.clock.elapsedTime * 0.85) * 0.008;
      const targetY = breath - fall * 0.34;
      const targetZ = tension * 0.05 + fall * 0.1;

      motion.current.position.y = reducedMotion
        ? targetY
        : THREE.MathUtils.damp(motion.current.position.y, targetY, 2.5, delta);
      motion.current.position.z = reducedMotion
        ? targetZ
        : THREE.MathUtils.damp(motion.current.position.z, targetZ, 2.6, delta);
      motion.current.rotation.z = reducedMotion
        ? fall * 0.12
        : THREE.MathUtils.damp(
            motion.current.rotation.z,
            tension * 0.025 + fall * 0.12 - attune * 0.008,
            2.2,
            delta,
          );
    }

    const { tension, fall } = phaseWeights(performance);
    const cameraTargetX = performance.attentionX * (0.06 + performance.recognition * 0.09);
    const cameraTargetY =
      0.18 +
      performance.attentionY * 0.025 -
      fall * 0.08 +
      (reducedMotion ? 0 : Math.sin(frame.clock.elapsedTime * 0.19) * 0.012);
    const cameraTargetZ = 5.05 + tension * 0.09 + fall * 0.28;

    camera.position.x = reducedMotion
      ? cameraTargetX
      : THREE.MathUtils.damp(camera.position.x, cameraTargetX, 1.4, delta);
    camera.position.y = reducedMotion
      ? cameraTargetY
      : THREE.MathUtils.damp(camera.position.y, cameraTargetY, 1.4, delta);
    camera.position.z = reducedMotion
      ? cameraTargetZ
      : THREE.MathUtils.damp(camera.position.z, cameraTargetZ, 1.5, delta);
    camera.lookAt(0, 0.05 - fall * 0.18, 0);

    const reportKey = `${performance.phase}:${performance.calmExitReady ? 1 : 0}:${performance.consequenceExitReady ? 1 : 0}`;
    if (
      reportKey !== lastReported.current ||
      frame.clock.elapsedTime - lastReportAt.current > 0.12
    ) {
      lastReported.current = reportKey;
      lastReportAt.current = frame.clock.elapsedTime;
      onPerformance(performance);
    }
  });

  return (
    <>
      <fog attach="fog" args={["#080706", 4.2, 9.4]} />
      <ambientLight intensity={0.22} color="#c7b4a3" />
      <directionalLight position={[-3, 5, 3]} intensity={1.35} color="#c7b2a0" />
      <pointLight position={[1.5, 1.1, 2.1]} intensity={2.2} distance={5.5} color="#b94f32" />
      <pointLight position={[-1.4, -0.4, 1.6]} intensity={0.72} distance={4} color="#6b4337" />

      <group ref={motion} rotation={[0, -0.16, 0]} position={[0.28, 0, 0]}>
        <group scale={fitted.scale}>
          <primitive object={fitted.scene} position={fitted.offset} />
        </group>
        <Fragments state={lastPerformanceSnapshot(lastReported, onPerformance)} reducedMotion={reducedMotion} />
      </group>

      <mesh position={[0, -2.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.8, 64]} />
        <meshStandardMaterial color="#0d0b0a" roughness={0.98} />
      </mesh>
    </>
  );
}

function lastPerformanceSnapshot(
  _lastReported: React.MutableRefObject<string>,
  _onPerformance: (state: SeraphPerformanceSnapshot) => void,
): SeraphPerformanceSnapshot {
  return {
    phase: "dormant",
    phaseAge: 0,
    presence: 0,
    movement: 0,
    stillness: 1,
    recognition: 0,
    strain: 0,
    fracture: 0,
    residue: 0,
    attentionX: 0,
    attentionY: 0,
    calmExitReady: false,
    consequenceExitReady: false,
  };
}

export default function SeraphPresenceCanvas(props: {
  reducedMotion: boolean;
  impulseVersion: number;
  keyboardPresence: boolean;
  onPerformance: (state: SeraphPerformanceSnapshot) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.45]}
      camera={{ position: [0, 0.18, 5.05], fov: 37 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
    >
      <color attach="background" args={["#080706"]} />
      <Scene {...props} />
    </Canvas>
  );
}
