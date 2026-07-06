"use client";

// ===== กล่องสินค้า 1 กล่องในฉาก 3D =====
// - สีตามกลุ่มสินค้า + ขอบเข้มของสีกลุ่ม
// - ถูกเลือก = เรืองแสง + ขอบขาว / กลุ่มอื่นถูก highlight = จางลง
// - คลิกเพื่อเลือกกล่อง, label SKU บนหน้ากล่องเมื่อเปิดโหมดป้ายชื่อ

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { ContainerSpec, PackedBox } from "@/lib/types";
import { usePackingStore } from "@/lib/store/packing-store";
import { boxCenterToThree, boxSizeToThree } from "./scene-utils";

const APPEAR_DURATION = 0.28; // วินาที — อนิเมชันกล่องโผล่หลังคำนวณ

export function CargoBox({
  box,
  spec,
  appearDelay = 0,
}: {
  box: PackedBox;
  spec: ContainerSpec;
  appearDelay?: number;
}) {
  const selectedBoxId = usePackingStore((s) => s.selectedBoxId);
  const selectedItemId = usePackingStore((s) => s.selectedItemId);
  const selectedGroupId = usePackingStore((s) => s.selectedGroupId);
  const showLabels = usePackingStore((s) => s.showLabels);
  const selectBox = usePackingStore((s) => s.selectBox);

  const selected = selectedBoxId === box.id;
  // เมื่อ highlight กลุ่ม/สินค้าอื่น กล่องนี้จะจางลง
  const dimmed =
    (selectedGroupId !== null && box.groupId !== selectedGroupId) ||
    (selectedItemId !== null && box.itemId !== selectedItemId);

  const center = useMemo(() => boxCenterToThree(box, spec), [box, spec]);
  const dims = useMemo(() => boxSizeToThree(box), [box]);

  // ขอบกล่อง: EdgesGeometry สร้างเอง เพื่อคุมสี/ความจางได้เต็มที่
  const edgesGeometry = useMemo(
    () =>
      new THREE.EdgesGeometry(new THREE.BoxGeometry(dims[0], dims[1], dims[2])),
    [dims]
  );
  useEffect(() => () => edgesGeometry.dispose(), [edgesGeometry]);

  const edgeColor = useMemo(
    () => `#${new THREE.Color(box.color).multiplyScalar(0.55).getHexString()}`,
    [box.color]
  );

  // อนิเมชันโผล่ทีละกล่อง: scale 0 → 1 ตาม delay
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  useFrame((_, delta) => {
    if (doneRef.current || !groupRef.current) return;
    elapsedRef.current += delta;
    const t = Math.min(
      1,
      Math.max(0, (elapsedRef.current - appearDelay) / APPEAR_DURATION)
    );
    const eased = 1 - Math.pow(1 - t, 3);
    groupRef.current.scale.setScalar(Math.max(0.0001, eased));
    if (t >= 1) doneRef.current = true;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectBox(box.id);
  };

  // แสดง label เฉพาะกล่องที่ใหญ่พอ เพื่อไม่ให้ฉากรก (SKU เป็นอักษรละติน ใช้ Text ได้)
  const showThisLabel = showLabels && !dimmed && box.size.length >= 60;

  return (
    <group ref={groupRef} position={center} scale={0.0001}>
      <mesh onClick={handleClick} castShadow={false} receiveShadow={false}>
        <boxGeometry args={dims} />
        <meshStandardMaterial
          color={box.color}
          roughness={0.6}
          metalness={0.05}
          transparent={dimmed}
          opacity={dimmed ? 0.15 : 1}
          depthWrite={!dimmed}
          emissive={selected ? box.color : "#000000"}
          emissiveIntensity={selected ? 0.45 : 0}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial
          color={selected ? "#ffffff" : edgeColor}
          transparent
          opacity={dimmed ? 0.08 : selected ? 1 : 0.9}
        />
      </lineSegments>
      {showThisLabel && (
        <Text
          position={[0, dims[1] / 2 + 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(0.14, dims[0] * 0.22)}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {box.sku}
        </Text>
      )}
    </group>
  );
}
