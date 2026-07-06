"use client";

// ===== ฉาก 3D หลัก: ตู้คอนเทนเนอร์โปร่งใส + พื้น grid + กล่องสินค้า =====
// - โหลดแบบ client-only (import ผ่าน next/dynamic ssr:false ในหน้า)
// - อ่านสถานะทั้งหมดจาก usePackingStore: ผลการจัด, มุมกล้อง, การเปิด/ปิด grid/frame/label
// - พิกัด: ดู scene-utils.ts (data.x=ยาว → three.x, data.y=กว้าง → three.z, data.z=สูง → three.y)

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, Grid } from "@react-three/drei";
import type { ContainerSpec } from "@/lib/types";
import { usePackingStore, type CameraPreset } from "@/lib/store/packing-store";
import { CargoBox } from "./cargo-box";
import { boxCenterToThree, containerDims } from "./scene-utils";

// ตำแหน่งกล้อง + จุดมองสำหรับแต่ละมุมมอง (คำนวณจากขนาดตู้ หน่วยเมตร)
function presetView(
  preset: CameraPreset,
  L: number,
  W: number,
  H: number
): { pos: [number, number, number]; look: [number, number, number] } {
  const look: [number, number, number] = [0, H * 0.35, 0];
  switch (preset) {
    case "top":
      return { pos: [0.001, Math.max(L, W) * 1.7 + H, 0.001], look: [0, 0, 0] };
    case "side":
      return { pos: [0, H * 0.55, W * 3.4 + 3], look };
    case "back":
      // ประตูตู้อยู่ปลาย +x — มองจากท้ายตู้เข้าไป
      return { pos: [L * 1.7 + 3, H * 0.7, 0.001], look };
    case "3d":
    default:
      return { pos: [L * 0.9 + 2.5, H * 1.9 + 2, W * 2.7 + 3.5], look };
  }
}

// คุมกล้อง: เลื่อนไปตาม preset / reset / focus ที่เลือกจาก store (ใช้ CameraControls)
function CameraRig({ spec }: { spec: ContainerSpec }) {
  const controlsRef = useRef<CameraControls>(null);
  const preset = usePackingStore((s) => s.cameraPreset);
  const resetCounter = usePackingStore((s) => s.cameraResetCounter);
  const focusCounter = usePackingStore((s) => s.focusCounter);
  const selectedBoxId = usePackingStore((s) => s.selectedBoxId);
  const result = usePackingStore((s) => s.result);

  const { L, W, H } = useMemo(() => containerDims(spec), [spec]);

  const applyPreset = (p: CameraPreset, smooth: boolean) => {
    const c = controlsRef.current;
    if (!c) return;
    const v = presetView(p, L, W, H);
    void c.setLookAt(
      v.pos[0], v.pos[1], v.pos[2],
      v.look[0], v.look[1], v.look[2],
      smooth
    );
  };

  // จัดมุมกล้องเริ่มต้น: snap ซ้ำทุกเฟรมช่วง ~1.3 วินาทีแรก เพื่อกันไม่ให้
  // การ initialize ภายในของ CameraControls มา reset มุมกล้องทับ (จัดครั้งเดียวไม่พอ)
  const initFrames = useRef(0);
  useFrame(() => {
    if (initFrames.current > 80) return;
    initFrames.current += 1;
    applyPreset(usePackingStore.getState().cameraPreset, false);
  });

  // เปลี่ยนมุมมอง / กดรีเซ็ต → เลื่อนกล้องแบบนุ่มไปตำแหน่ง preset
  useEffect(() => {
    if (initFrames.current <= 80) return; // ช่วงแรกให้ useFrame จัดการ
    applyPreset(preset, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, resetCounter]);

  // โฟกัสกล่องที่เลือก
  useEffect(() => {
    if (focusCounter === 0) return;
    const c = controlsRef.current;
    const box = result?.packed.find((b) => b.id === selectedBoxId);
    if (!c || !box) return;
    const ctr = boxCenterToThree(box, spec);
    void c.setLookAt(
      ctr[0] + 2.2, ctr[1] + 1.8, ctr[2] + 2.6,
      ctr[0], ctr[1], ctr[2],
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCounter]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1.5}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

// โครงตู้: ผนังโปร่งแสง (เห็นด้านใน) + เส้นขอบ + แถบสีที่ปลายประตู
function ContainerFrame({
  spec,
  show,
}: {
  spec: ContainerSpec;
  show: boolean;
}) {
  const { L, W, H } = containerDims(spec);
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(L, H, W)),
    [L, W, H]
  );
  useEffect(() => () => edges.dispose(), [edges]);

  if (!show) return null;

  return (
    <group position={[0, H / 2, 0]}>
      {/* ผนังโปร่งแสง — เรนเดอร์เฉพาะด้านหลังเพื่อไม่บังกล่องด้านใน */}
      <mesh>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial
          color="#93c5fd"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#475569" transparent opacity={0.75} />
      </lineSegments>
      {/* แถบปลายประตูตู้ (ด้าน +x = ลงของก่อน) */}
      <mesh position={[L / 2 + 0.01, 0, 0]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function ContainerScene({ spec }: { spec: ContainerSpec }) {
  const result = usePackingStore((s) => s.result);
  const showGrid = usePackingStore((s) => s.showGrid);
  const showFrame = usePackingStore((s) => s.showFrame);

  const { L, W, H } = containerDims(spec);
  const init = presetView("3d", L, W, H);
  const floor = Math.max(L, W) * 3;

  return (
    <Canvas
      frameloop="always"
      dpr={[1, 2]}
      camera={{ position: init.pos, fov: 42, near: 0.1, far: 300 }}
      gl={{ antialias: true }}
      onPointerMissed={() => usePackingStore.setState({ selectedBoxId: null })}
    >
      <color attach="background" args={["#f8fafc"]} />

      {/* แสง */}
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#ffffff", "#e2e8f0", 0.45]} />
      <directionalLight position={[6, 14, 8]} intensity={1.1} />
      <directionalLight position={[-7, 9, -6]} intensity={0.35} />

      {/* พื้นรองรับ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[floor, floor]} />
        <meshStandardMaterial color="#eef2f7" />
      </mesh>

      {showGrid && (
        <Grid
          position={[0, 0.004, 0]}
          args={[Math.ceil(L) + 2, Math.ceil(W) + 2]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#cbd5e1"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#94a3b8"
          fadeDistance={38}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      <ContainerFrame spec={spec} show={showFrame} />

      {result?.packed.map((box, i) => (
        <CargoBox
          key={box.id}
          box={box}
          spec={spec}
          appearDelay={Math.min(i * 0.015, 0.7)}
        />
      ))}

      <CameraRig spec={spec} />
    </Canvas>
  );
}
