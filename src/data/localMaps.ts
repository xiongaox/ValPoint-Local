/**
 * localMaps - local地图
 *
 * 职责：
 * - 承载local地图相关的模块实现。
 * - 组织内部依赖与导出接口。
 * - 为上层功能提供支撑。
 */

import { MapOption } from '../types/lineup';

export const LOCAL_MAPS: MapOption[] = [
  {
    "displayName": "Ascent",
    "displayIcon": "/maps/covers/亚海悬城.webp"
  },
  {
    "displayName": "Abyss",
    "displayIcon": "/maps/covers/幽邃地窟.webp"
  },
  {
    "displayName": "Split",
    "displayIcon": "/maps/covers/霓虹町.webp"
  },
  {
    "displayName": "Fracture",
    "displayIcon": "/maps/covers/裂变峡谷.webp"
  },
  {
    "displayName": "Bind",
    "displayIcon": "/maps/covers/源工重镇.webp"
  },
  {
    "displayName": "Breeze",
    "displayIcon": "/maps/covers/微风岛屿.webp"
  },
  {
    "displayName": "Lotus",
    "displayIcon": "/maps/covers/莲华古城.webp"
  },
  {
    "displayName": "Sunset",
    "displayIcon": "/maps/covers/日落之城.webp"
  },
  {
    "displayName": "Pearl",
    "displayIcon": "/maps/covers/深海明珠.webp"
  },
  {
    "displayName": "Icebox",
    "displayIcon": "/maps/covers/森寒冬港.webp"
  },
  {
    "displayName": "Corrode",
    "displayIcon": "/maps/covers/盐海矿镇.webp"
  },
  {
    "displayName": "Haven",
    "displayIcon": "/maps/covers/隐世修所.webp"
  }
];
