"use client";

import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useMemo } from "react";
import * as THREE from "three";

const MODEL_URL = "/assets/serara-canonical.glb";
const TARGET_HEIGHT = 3.65;

export type SeraraExhibitionMemory = {
  phase: string;
  grace: number;
  tension: number;
  fall: number;
  recognition: number;
  stillness: number;
  afterimage: number;
  residue: number;
  heat: number;
  attentionX: number;
  attentionY: number;
};

type BoneKey =
  | "hips"
  | "spine"
  | "spine1"
  | "spine2"
  | "neck"
  | "head"
  | "leftShoulder"
  | "rightShoulder"
  | "leftArm"
  | "rightArm"
  | "leftForeArm"
  | "rightForeArm"
  | "leftHand"
  | "rightHand"
  | "leftUpLeg"
  | "rightUpLeg"
  | "leftLeg"
  | "rightLeg";

type PostureOffsets = Partial<Record<BoneKey, [number, number, number]>>;

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
  leftUpLeg: "LeftUpLeg",
  rightUpLeg: "RightUpLeg",
  leftLeg: "LeftLeg",
  rightLeg: "RightLeg",
};

const POSTURES: Record<"grace" | "tension" | "fall", PostureOffsets> = {
  grace: {
    hips: [-0.012, 0, 0],
    spine: [-0.03, 0, 0],
    spine1: [-0.04, 0, 0],
    spine2: [-0.06, 0, 0],
    neck: [0.026, 0, 0],
    head: [0.015, 0, 0],
    leftShoulder: [0, 0.018, -0.055],
    rightShoulder: [0, -0.018, 0.055],
    leftArm: [0, 0, -0.045],
    rightArm: [0, 0, 0.045],
  },
  tension: {
    hips: [0.018, 0, -0.032],
    spine: [0.038, 0.004, -0.045],
    spine1: [0.058, -0.008, -0.06],
    spine2: [0.046, 0.014, -0.075],
    neck: [-0.014, 0.028, 0.042],
    head: [0.02, -0.024, 0.052],
    leftShoulder: [0.036, 0.028, 0.1],
    rightShoulder: [-0.016, -0.02, -0.068],
    leftArm: [0.036, 0.01, 0.06],
    rightArm: [-0.024, 0, -0.044],
    leftForeArm: [0.04, 0, 0.032],
    rightForeArm: [0.016, 0, -0.024],
    leftHand: [0.02, 0.01, 0.018],
    rightHand: [0.012, -0.008, -0.014],
    leftUpLeg: [0.016, 0, 0.02],
    rightUpLeg: [-0.01, 0, -0.024],
  },
  fall: {
    hips: [0.12, 0.024, -0.068],
    spine: [0.14, 0, -0.045],
    spine1: [0.17, 0.014, -0.06],
    spine2: [0.19, -0.02, -0.084],
    neck: [0.15, 0.032, 0.044],
    head: [0.17, -0.032, 0.072],
    leftShoulder: [0.068, 0.032, 0.128],
    rightShoulder: [0.052, -0.024, -0.108],
    leftArm: [0.056, 0.014, 0.076],
    rightArm: [0.042, -0.01, -0.064],
    leftForeArm: [0.096, 0, 0.052],
    rightForeArm: [0.076, 0, -0.042],
    leftHand: [0.055, 0.018, 0.04],
    rightHand: [0.045, -0.012, -0.032],
    leftUpLeg: [0.105, 0, 0.024],
    rightUpLeg: [0.076, 0, -0.02],
    leftLeg: [-0.112, 0, 0],
    rightLeg: [-0.084, 0, 0],
  },
};

function clamp01(value: number) {
  return THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

function buildRememberedBody(
  source: THREE.Object3D,
  memory: SeraraExhibitionMemory,
) {
  const scene = clone(source);
  const binds = new Map<THREE.Bone, THREE.Quaternion>();
  const strength = THREE.MathUtils.clamp(
    0.075 +
      clamp01(memory.afterimage) * 0.1 +
      clamp01(memory.residue) * 0.055 +
      clamp01(memory.recognition) * 0.035,
    0.075,
    0.24,
  );

  scene.traverse((object) => {
    if (object instanceof THREE.Bone) {
      binds.set(object, object.quaternion.clone());
      return;
    }

    if (!(object instanceof THREE.Mesh)) return;

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#86b8b3").lerp(
        new THREE.Color("#d5b2a0"),
        clamp01(memory.heat) * 0.16,
      ),
      transparent: true,
      opacity: strength,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    if (Array.isArray(object.material)) {
      object.material = object.material.map(() => material.clone());
    } else {
      object.material = material;
    }

    if (object.morphTargetDictionary && object.morphTargetInfluences) {
      const targets: Record<string, number> = {
        FACE_RELAXED: clamp01(memory.grace * 0.28 + memory.recognition * 0.16),
        FACE_TENSION: clamp01(memory.tension * 0.72),
        FACE_FALL: clamp01(memory.fall * 0.78),
        EYES_NARROW: clamp01(
          memory.tension * 0.34 +
            memory.fall * 0.64 -
            memory.recognition * 0.085,
        ),
        MOUTH_SEAM_OPEN: clamp01(
          memory.tension * 0.035 + memory.fall * 0.13,
        ),
      };

      for (const [name, value] of Object.entries(targets)) {
        const index = object.morphTargetDictionary[name];
        if (index !== undefined) object.morphTargetInfluences[index] = value;
      }
    }
  });

  (Object.keys(BONE_NAMES) as BoneKey[]).forEach((key) => {
    const bone = scene.getObjectByName(BONE_NAMES[key]);
    if (!(bone instanceof THREE.Bone)) return;

    const bind = binds.get(bone);
    if (!bind) return;

    const grace = POSTURES.grace[key] ?? [0, 0, 0];
    const tension = POSTURES.tension[key] ?? [0, 0, 0];
    const fall = POSTURES.fall[key] ?? [0, 0, 0];

    let x =
      grace[0] * memory.grace +
      tension[0] * memory.tension +
      fall[0] * memory.fall;
    let y =
      grace[1] * memory.grace +
      tension[1] * memory.tension +
      fall[1] * memory.fall;
    const z =
      grace[2] * memory.grace +
      tension[2] * memory.tension +
      fall[2] * memory.fall;

    if (key === "head") {
      x += -memory.attentionY * (0.045 + memory.recognition * 0.05);
      y += memory.attentionX * (0.08 + memory.recognition * 0.07);
    } else if (key === "neck") {
      x += -memory.attentionY * (0.016 + memory.recognition * 0.018);
      y += memory.attentionX * (0.025 + memory.recognition * 0.025);
    } else if (key === "spine2") {
      x += -memory.attentionY * memory.afterimage * 0.012;
      y += memory.attentionX * memory.afterimage * 0.014;
    }

    const posture = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(x, y, z, "XYZ"),
    );
    bone.quaternion.copy(bind).multiply(posture);
  });

  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  return {
    scene,
    scale: TARGET_HEIGHT / Math.max(size.y, 0.001),
    offset: new THREE.Vector3(-center.x, -center.y, -center.z),
  };
}

function RememberedBody({
  memory,
}: {
  memory: SeraraExhibitionMemory;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const fitted = useMemo(
    () => buildRememberedBody(scene, memory),
    [
      scene,
      memory.grace,
      memory.tension,
      memory.fall,
      memory.recognition,
      memory.afterimage,
      memory.residue,
      memory.heat,
      memory.attentionX,
      memory.attentionY,
    ],
  );

  const yaw =
    memory.attentionX * (0.022 + memory.afterimage * 0.025) -
    memory.fall * 0.04;
  const pitch =
    -memory.attentionY * (0.008 + memory.afterimage * 0.008) +
    memory.fall * 0.012;
  const roll =
    -memory.attentionX * 0.003 +
    memory.tension * 0.012 +
    memory.fall * 0.04;

  return (
    <group
      position={[
        memory.attentionX * memory.afterimage * 0.014,
        -memory.attentionY * memory.afterimage * 0.006,
        0,
      ]}
      rotation={[pitch, yaw, roll]}
    >
      <group scale={fitted.scale}>
        <primitive object={fitted.scene} position={fitted.offset} />
      </group>
    </group>
  );
}

export default function SeraraAfterimageBody({
  memory,
}: {
  memory: SeraraExhibitionMemory;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      aria-hidden="true"
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 0.05, 7.45]}
        fov={34}
      />
      <RememberedBody memory={memory} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
