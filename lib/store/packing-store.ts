// ===== Zustand store: หน้าจัดของเข้า Container แบบ 3D =====
import { create } from "zustand";
import type {
  CargoGroup,
  CargoItem,
  ContainerSize,
  PackingResult,
  PlanStatus,
} from "@/lib/types";
import { CONTAINER_SPECS } from "@/lib/container-specs";
import { PACKING_ORDERS } from "@/lib/mock/packing-orders";
import { computePacking } from "@/lib/algorithms/packing";

export type CameraPreset = "3d" | "top" | "side" | "back";
export type ItemFilter = "all" | "packed" | "unpacked" | "problem";
export type WorkspacePhase = "select" | "workspace";

export interface PackingStore {
  phase: WorkspacePhase;
  selectedOrderIds: string[];
  activeGroups: CargoGroup[];
  activeItems: CargoItem[];
  containerType: ContainerSize;
  planStatus: PlanStatus;
  result: PackingResult | null;
  selectedGroupId: string | null;
  selectedItemId: string | null;
  selectedBoxId: string | null;
  showLabels: boolean;
  showGrid: boolean;
  showFrame: boolean;
  cameraPreset: CameraPreset;
  cameraResetCounter: number;
  focusCounter: number;
  itemFilter: ItemFilter;
  search: string;

  toggleOrder: (id: string) => void;
  clearOrderSelection: () => void;
  setSelectedOrders: (ids: string[]) => void;
  // seed จากหน่วยงานในแผน: ตั้งออเดอร์+ชนิดตู้ แล้วเข้า workspace พร้อมคำนวณ
  seedFromPlanUnit: (orderIds: string[], containerType: ContainerSize) => void;
  enterWorkspace: () => void;
  backToSelection: () => void;
  setContainerType: (t: ContainerSize) => void;
  compute: () => void;
  clear: () => void;
  selectGroup: (id: string) => void;
  selectItem: (id: string) => void;
  selectBox: (id: string) => void;
  toggleLabels: () => void;
  toggleGrid: () => void;
  toggleFrame: () => void;
  setCameraPreset: (p: CameraPreset) => void;
  resetCamera: () => void;
  focusSelected: () => void;
  setItemFilter: (f: ItemFilter) => void;
  setSearch: (s: string) => void;
}

export const usePackingStore = create<PackingStore>()((set, get) => ({
  phase: "select",
  selectedOrderIds: [],
  activeGroups: [],
  activeItems: [],
  containerType: "40HQ",
  planStatus: "draft",
  result: null,
  selectedGroupId: null,
  selectedItemId: null,
  selectedBoxId: null,
  showLabels: false,
  showGrid: true,
  showFrame: true,
  cameraPreset: "3d",
  cameraResetCounter: 0,
  focusCounter: 0,
  itemFilter: "all",
  search: "",

  // เลือก/ยกเลิกเลือกออเดอร์ในหน้าเลือกออเดอร์ (ก่อนเข้า workspace)
  toggleOrder: (id) =>
    set((s) => ({
      selectedOrderIds: s.selectedOrderIds.includes(id)
        ? s.selectedOrderIds.filter((orderId) => orderId !== id)
        : [...s.selectedOrderIds, id],
    })),
  clearOrderSelection: () => set({ selectedOrderIds: [] }),
  setSelectedOrders: (ids) => set({ selectedOrderIds: ids }),

  // seed จากหน่วยงานในแผน: ตั้งออเดอร์+ชนิดตู้ แล้วเข้า workspace พร้อมคำนวณ
  seedFromPlanUnit: (orderIds, containerType) => {
    set({ selectedOrderIds: orderIds, containerType });
    get().enterWorkspace();
  },

  // เข้าสู่ workspace 3D ด้วยออเดอร์ที่เลือกไว้ → คำนวณแผนทันที
  enterWorkspace: () => {
    set({ phase: "workspace" });
    get().compute();
  },

  // กลับไปหน้าเลือกออเดอร์ — คงรายการที่เลือกไว้ ล้างผลแผนเดิม
  backToSelection: () =>
    set({
      phase: "select",
      result: null,
      planStatus: "draft",
      activeGroups: [],
      activeItems: [],
      selectedGroupId: null,
      selectedItemId: null,
      selectedBoxId: null,
    }),

  // เปลี่ยนประเภทตู้ → ล้างผลเดิม กลับเป็นร่างแผน
  setContainerType: (t) =>
    set({
      containerType: t,
      result: null,
      planStatus: "draft",
      selectedGroupId: null,
      selectedItemId: null,
      selectedBoxId: null,
    }),

  // คำนวณแผนการจัด จากออเดอร์ที่เลือกไว้ → ตั้งสถานะตามผล (มีคำเตือน / คำนวณแล้ว)
  compute: () => {
    const { selectedOrderIds, containerType } = get();
    const selectedOrders = PACKING_ORDERS.filter((o) =>
      selectedOrderIds.includes(o.id)
    );
    const groups: CargoGroup[] = selectedOrders.map((o) => ({
      id: o.id,
      name: o.customer,
      destination: o.destination,
      color: o.color,
      unloadOrder: o.unloadOrder,
    }));
    const items: CargoItem[] = selectedOrders.flatMap((o) => o.items);

    const spec = CONTAINER_SPECS[containerType];
    const result = computePacking(items, groups, spec);
    set({
      result,
      activeGroups: groups,
      activeItems: items,
      planStatus: result.warnings.length > 0 ? "has_warning" : "calculated",
      selectedBoxId: null,
    });
  },

  clear: () =>
    set({
      result: null,
      planStatus: "draft",
      selectedGroupId: null,
      selectedItemId: null,
      selectedBoxId: null,
    }),

  // คลิกซ้ำรายการเดิม = ยกเลิกเลือก (เลือกได้ทีละอย่าง)
  selectGroup: (id) =>
    set((s) => ({
      selectedGroupId: s.selectedGroupId === id ? null : id,
      selectedItemId: null,
      selectedBoxId: null,
    })),
  selectItem: (id) =>
    set((s) => ({
      selectedItemId: s.selectedItemId === id ? null : id,
      selectedGroupId: null,
      selectedBoxId: null,
    })),
  selectBox: (id) =>
    set((s) => ({
      selectedBoxId: s.selectedBoxId === id ? null : id,
      selectedGroupId: null,
      selectedItemId: null,
    })),

  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleFrame: () => set((s) => ({ showFrame: !s.showFrame })),

  setCameraPreset: (p) => set({ cameraPreset: p }),
  resetCamera: () =>
    set((s) => ({ cameraResetCounter: s.cameraResetCounter + 1 })),
  focusSelected: () => set((s) => ({ focusCounter: s.focusCounter + 1 })),

  setItemFilter: (f) => set({ itemFilter: f }),
  setSearch: (s) => set({ search: s }),
}));
