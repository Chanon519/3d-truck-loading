// ===== Best Fit demo algorithm: จัดกล่องสินค้าเข้าตู้คอนเทนเนอร์ (deterministic) =====
// พิกัด (ตาม lib/types.ts): x = ตามความยาวตู้ (0 = ผนังในสุด, ประตูอยู่ที่ x = innerLength),
// y = ตามความกว้างตู้, z = ความสูงจากพื้นตู้ — หน่วยเซนติเมตรทั้งหมด
//
// แนวคิด: เรียงกลุ่มตามลำดับการลงของ (ส่งท้ายสุด = โหลดเข้าก่อน = อยู่ในสุด)
// แล้ววางทีละกล่องด้วย candidate points (extreme points อย่างง่าย)
// เลือกจุดที่ z ต่ำสุดก่อน → x ต่ำสุด → y ต่ำสุด พร้อมลองหมุน 90° ถ้าสินค้าหมุนได้

import type {
  CargoGroup,
  CargoItem,
  ContainerSpec,
  PackedBox,
  PackingResult,
} from "@/lib/types";
import { containerVolumeM3 } from "@/lib/container-specs";
import { formatNumber } from "@/lib/labels";

const EPS = 0.001; // กันปัญหาเลขทศนิยม
const SUPPORT_RATIO = 0.7; // พื้นที่ฐานต้องมีของรองรับอย่างน้อย 70%

interface Point {
  x: number;
  y: number;
  z: number;
}

interface BoxSize {
  length: number; // ตามแกน x
  width: number; // ตามแกน y
  height: number; // ตามแกน z
}

// กล่องที่วางแล้ว + คุณสมบัติสินค้าที่ต้องใช้ตรวจเงื่อนไขการซ้อน
interface PlacedBox {
  position: Point;
  size: BoxSize;
  weightKg: number;
  noStack: boolean;
  fragile: boolean;
}

// สาเหตุที่ลองวางแล้วไม่ผ่าน — ใช้สรุปเหตุผลของสินค้าที่จัดไม่ได้
interface FailFlags {
  overweight: boolean;
  noSupport: boolean;
}

function overlap1D(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

function boxesOverlap(p: Point, s: BoxSize, q: PlacedBox): boolean {
  return (
    overlap1D(p.x, p.x + s.length, q.position.x, q.position.x + q.size.length) > EPS &&
    overlap1D(p.y, p.y + s.width, q.position.y, q.position.y + q.size.width) > EPS &&
    overlap1D(p.z, p.z + s.height, q.position.z, q.position.z + q.size.height) > EPS
  );
}

// ตรวจว่าวางที่จุดนี้ได้ไหม (ขอบตู้ / ชนกล่องอื่น / พื้นผิวรองรับ / เงื่อนไขแตกง่าย-ห้ามซ้อน)
function canPlace(
  p: Point,
  s: BoxSize,
  item: CargoItem,
  placed: PlacedBox[],
  spec: ContainerSpec,
  flags: FailFlags
): boolean {
  // 1) อยู่ในขอบตู้ทั้ง 3 แกน
  if (
    p.x + s.length > spec.innerLength + EPS ||
    p.y + s.width > spec.innerWidth + EPS ||
    p.z + s.height > spec.innerHeight + EPS
  ) {
    return false;
  }

  // 2) ไม่ overlap กับกล่องที่วางแล้ว (AABB)
  for (const q of placed) {
    if (boxesOverlap(p, s, q)) return false;
  }

  // 3) ถ้าลอยจากพื้น ต้องมีกล่องรองรับพื้นที่ฐาน ≥ 70%
  if (p.z > EPS) {
    const baseArea = s.length * s.width;
    let supportedArea = 0;
    for (const q of placed) {
      const topZ = q.position.z + q.size.height;
      if (Math.abs(topZ - p.z) > EPS) continue; // ไม่ใช่กล่องที่ผิวบนอยู่ระดับเดียวกับฐาน
      const ox = overlap1D(p.x, p.x + s.length, q.position.x, q.position.x + q.size.length);
      const oy = overlap1D(p.y, p.y + s.width, q.position.y, q.position.y + q.size.width);
      const area = ox * oy;
      if (area <= EPS) continue;
      // กล่องรองรับต้องไม่เป็นสินค้าห้ามซ้อนทับ
      if (q.noStack) {
        flags.noSupport = true;
        return false;
      }
      // ห้ามวางของที่หนักกว่าทับกล่องแตกง่าย
      if (q.fragile && item.weightKg > q.weightKg) {
        flags.noSupport = true;
        return false;
      }
      supportedArea += area;
    }
    if (supportedArea < baseArea * SUPPORT_RATIO - EPS) {
      flags.noSupport = true;
      return false;
    }
  }

  return true;
}

// สร้างเหตุผลการวางแบบภาษาคน จากบริบทจริงของกล่องนั้น ๆ
function buildReason(
  item: CargoItem,
  group: CargoGroup,
  pos: Point,
  rotated: boolean,
  maxUnloadOrder: number,
  minUnloadOrder: number
): string {
  if (item.noStack) {
    return `สินค้าห้ามซ้อนทับ วางในตำแหน่งที่ไม่มีของด้านบน`;
  }
  if (item.heavy && pos.z <= EPS) {
    return `สินค้าหนัก (${formatNumber(item.weightKg)} กก.) จัดไว้ชั้นล่างเพื่อความปลอดภัย`;
  }
  if (rotated) {
    return `หมุน 90° เพื่อให้พอดีพื้นที่ที่เหลือ`;
  }
  if (item.fragile && pos.z > EPS) {
    return `สินค้าแตกง่าย จัดไว้ชั้นบนเพื่อไม่ให้ถูกของหนักทับ`;
  }
  if (group.unloadOrder === maxUnloadOrder) {
    return `วางด้านในสุด เพราะกลุ่มปลายทาง${group.destination}ส่งเป็นลำดับสุดท้าย`;
  }
  if (group.unloadOrder === minUnloadOrder) {
    return `วางใกล้ประตูตู้ เพราะปลายทาง${group.destination}ต้องลงของเป็นลำดับแรก`;
  }
  if (pos.z > EPS) {
    return `วางซ้อนชั้นบน (สูง ${formatNumber(Math.round(pos.z))} ซม.) โดยมีพื้นผิวรองรับมั่นคง`;
  }
  return `จัดตามลำดับปลายทาง${group.destination} เพื่อให้ลงของตามคิวได้สะดวก`;
}

export function computePacking(
  items: CargoItem[],
  groups: CargoGroup[],
  spec: ContainerSpec
): PackingResult {
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const orders = groups.map((g) => g.unloadOrder);
  const maxUnloadOrder = Math.max(...orders);
  const minUnloadOrder = Math.min(...orders);

  // 1) เรียงกลุ่มตาม unloadOrder มาก→น้อย (ส่งท้ายสุด = โหลดก่อน = อยู่ในสุด / x ต่ำ)
  const sortedGroups = [...groups].sort((a, b) => b.unloadOrder - a.unloadOrder);

  // 2) ในกลุ่ม: noStack ไว้ท้ายกลุ่ม, ของหนักก่อน, แล้วปริมาตรมาก→น้อย (ผูก tie ด้วย id ให้ deterministic)
  const orderedItems: CargoItem[] = [];
  for (const g of sortedGroups) {
    const inGroup = items
      .filter((it) => it.groupId === g.id)
      .sort((a, b) => {
        if (a.noStack !== b.noStack) return a.noStack ? 1 : -1;
        if (a.heavy !== b.heavy) return a.heavy ? -1 : 1;
        const va = a.length * a.width * a.height;
        const vb = b.length * b.width * b.height;
        if (vb !== va) return vb - va;
        return a.id.localeCompare(b.id);
      });
    orderedItems.push(...inGroup);
  }

  const placed: PlacedBox[] = [];
  const packed: PackedBox[] = [];
  const unpackedItems: PackingResult["unpackedItems"] = [];

  // 3) candidate points เริ่มที่มุมในสุดของตู้
  let points: Point[] = [{ x: 0, y: 0, z: 0 }];
  let usedWeightKg = 0;
  let usedVolumeCm3 = 0;

  const sortPoints = () => {
    // เลือก z ต่ำสุดก่อน → x ต่ำสุด → y ต่ำสุด
    points.sort((a, b) => a.z - b.z || a.x - b.x || a.y - b.y);
  };

  for (const item of orderedItems) {
    const group = groupById.get(item.groupId);
    if (!group) continue;

    let qtyLeft = 0;
    let overweightHit = false;
    let noSupportHit = false;

    for (let n = 0; n < item.qty; n++) {
      // เงื่อนไขน้ำหนักสะสมห้ามเกินพิกัดตู้
      if (usedWeightKg + item.weightKg > spec.maxWeightKg + EPS) {
        overweightHit = true;
        qtyLeft++;
        continue;
      }

      // ลอง orientation ปกติ และหมุน 90° รอบแกนตั้ง (สลับ length/width) ถ้า rotatable
      const orientations: { size: BoxSize; rotated: boolean }[] = [
        {
          size: { length: item.length, width: item.width, height: item.height },
          rotated: false,
        },
      ];
      if (item.rotatable && item.length !== item.width) {
        orientations.push({
          size: { length: item.width, width: item.length, height: item.height },
          rotated: true,
        });
      }

      sortPoints();
      const flags: FailFlags = { overweight: false, noSupport: false };
      let placedAt: { point: Point; size: BoxSize; rotated: boolean } | null = null;

      // เลือกตำแหน่งแรกที่ผ่านเงื่อนไข (จุดถูกเรียง z → x → y แล้ว)
      outer: for (const point of points) {
        for (const o of orientations) {
          if (canPlace(point, o.size, item, placed, spec, flags)) {
            placedAt = { point, size: o.size, rotated: o.rotated };
            break outer;
          }
        }
      }

      if (!placedAt) {
        if (flags.noSupport) noSupportHit = true;
        qtyLeft++;
        continue;
      }

      const { point, size, rotated } = placedAt;
      placed.push({
        position: { ...point },
        size,
        weightKg: item.weightKg,
        noStack: item.noStack,
        fragile: item.fragile,
      });
      packed.push({
        id: `${item.id}-${n + 1}`,
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        groupId: item.groupId,
        position: { ...point },
        size,
        rotated,
        weightKg: item.weightKg,
        color: group.color,
        reason: buildReason(item, group, point, rotated, maxUnloadOrder, minUnloadOrder),
      });

      usedWeightKg += item.weightKg;
      usedVolumeCm3 += size.length * size.width * size.height;

      // อัปเดต candidate points: ตัดจุดที่ใช้ แล้วเพิ่มจุดใหม่ 3 ทิศจากกล่องที่เพิ่งวาง
      points = points.filter(
        (p) =>
          !(
            Math.abs(p.x - point.x) < EPS &&
            Math.abs(p.y - point.y) < EPS &&
            Math.abs(p.z - point.z) < EPS
          )
      );
      const newPoints: Point[] = [
        { x: point.x + size.length, y: point.y, z: point.z },
        { x: point.x, y: point.y + size.width, z: point.z },
        { x: point.x, y: point.y, z: point.z + size.height },
      ];
      for (const np of newPoints) {
        if (
          np.x < spec.innerLength - EPS &&
          np.y < spec.innerWidth - EPS &&
          np.z < spec.innerHeight - EPS
        ) {
          // ไม่เพิ่มจุดที่อยู่ภายในกล่องที่วางแล้ว
          const inside = placed.some(
            (q) =>
              np.x > q.position.x - EPS &&
              np.x < q.position.x + q.size.length - EPS &&
              np.y > q.position.y - EPS &&
              np.y < q.position.y + q.size.width - EPS &&
              np.z > q.position.z - EPS &&
              np.z < q.position.z + q.size.height - EPS
          );
          if (!inside) points.push(np);
        }
      }
    }

    // 5) วางไม่ได้ → บันทึกพร้อมเหตุผลภาษาไทย
    if (qtyLeft > 0) {
      const reason = overweightHit
        ? "เกินน้ำหนักบรรทุกสูงสุด"
        : noSupportHit
          ? "ไม่มีพื้นผิวรองรับที่ปลอดภัย"
          : "พื้นที่ไม่พอ";
      unpackedItems.push({ item, qtyLeft, reason });
    }
  }

  // 7) สรุปผลรวม + คำเตือนภาษาไทย
  const totalVolumeM3 = containerVolumeM3(spec);
  const usedVolumeM3 = usedVolumeCm3 / 1_000_000;
  const weightPercent = (usedWeightKg / spec.maxWeightKg) * 100;
  const volumePercent = (usedVolumeM3 / totalVolumeM3) * 100;

  const warnings: string[] = [];
  if (unpackedItems.length > 0) {
    const boxesLeft = unpackedItems.reduce((sum, u) => sum + u.qtyLeft, 0);
    warnings.push(
      `มีสินค้า ${formatNumber(unpackedItems.length)} รายการ (${formatNumber(boxesLeft)} กล่อง) ที่จัดเข้าตู้ไม่ได้`
    );
  }
  const fragileSkus = new Set(packed.filter((b) => {
    const it = items.find((i) => i.id === b.itemId);
    return it?.fragile;
  }).map((b) => b.sku));
  if (fragileSkus.size > 0) {
    warnings.push(
      `มีสินค้าแตกง่าย ${formatNumber(fragileSkus.size)} SKU โปรดระมัดระวังการขนย้าย`
    );
  }
  if (weightPercent > 90) {
    warnings.push(`น้ำหนักรวมใช้ไป ${Math.round(weightPercent)}% ของพิกัดตู้ ใกล้เต็มพิกัด`);
  }
  if (volumePercent > 90) {
    warnings.push(`ปริมาตรใช้ไป ${Math.round(volumePercent)}% ของตู้ พื้นที่เหลือน้อยมาก`);
  }

  return {
    packed,
    unpackedItems,
    usedWeightKg,
    usedVolumeM3: Math.round(usedVolumeM3 * 100) / 100,
    totalVolumeM3: Math.round(totalVolumeM3 * 100) / 100,
    weightPercent: Math.round(weightPercent * 10) / 10,
    volumePercent: Math.round(volumePercent * 10) / 10,
    warnings,
  };
}
