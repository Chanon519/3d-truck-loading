// ===== ขนาดภายในตู้คอนเทนเนอร์มาตรฐาน (หน่วย ซม.) =====
import type { ContainerSize, ContainerSpec } from "./types";

export const CONTAINER_SPECS: Record<ContainerSize, ContainerSpec> = {
  "20FT": {
    type: "20FT",
    label: "ตู้ 20 ฟุต (20FT)",
    innerLength: 590,
    innerWidth: 235,
    innerHeight: 239,
    maxWeightKg: 28200,
  },
  "40FT": {
    type: "40FT",
    label: "ตู้ 40 ฟุต (40FT)",
    innerLength: 1203,
    innerWidth: 235,
    innerHeight: 239,
    maxWeightKg: 26600,
  },
  "40HQ": {
    type: "40HQ",
    label: "ตู้ 40 ฟุต ไฮคิวบ์ (40HQ)",
    innerLength: 1203,
    innerWidth: 235,
    innerHeight: 269,
    maxWeightKg: 26580,
  },
};

export function containerVolumeM3(spec: ContainerSpec): number {
  return (spec.innerLength * spec.innerWidth * spec.innerHeight) / 1_000_000;
}
