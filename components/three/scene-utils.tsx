// ===== ตัวช่วยแปลงพิกัดข้อมูล (ซม.) → พิกัดฉาก three.js (เมตร) =====
// แกน data → three: data.x (ความยาวตู้) → three.x, data.y (ความกว้าง) → three.z,
// data.z (ความสูงจากพื้น) → three.y — จัดให้ตู้ center ที่จุดกำเนิด และพื้นตู้อยู่ที่ y = 0
import type { ContainerSpec, PackedBox } from "@/lib/types";

export const CM = 100; // ซม. ต่อเมตร

// จุดกึ่งกลางกล่องในพิกัดฉาก three.js (เมตร)
export function boxCenterToThree(
  box: PackedBox,
  spec: ContainerSpec
): [number, number, number] {
  return [
    (box.position.x + box.size.length / 2 - spec.innerLength / 2) / CM,
    (box.position.z + box.size.height / 2) / CM,
    (box.position.y + box.size.width / 2 - spec.innerWidth / 2) / CM,
  ];
}

// ขนาดกล่องสำหรับ boxGeometry (three: [x, y, z] = [ยาว, สูง, กว้าง] เมตร)
export function boxSizeToThree(box: PackedBox): [number, number, number] {
  return [box.size.length / CM, box.size.height / CM, box.size.width / CM];
}

// ขนาดตู้ในหน่วยเมตร (L = แกน x, H = แกน y, W = แกน z)
export function containerDims(spec: ContainerSpec): {
  L: number;
  W: number;
  H: number;
} {
  return {
    L: spec.innerLength / CM,
    W: spec.innerWidth / CM,
    H: spec.innerHeight / CM,
  };
}
