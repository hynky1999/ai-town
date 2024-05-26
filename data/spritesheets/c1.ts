import { SpritesheetData } from './types';

export const data: SpritesheetData = {
  frames: {
    left: {
      frame: { x: 0, y: 96, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    left2: {
      frame: { x: 32, y: 96, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    left3: {
      frame: { x: 64, y: 96, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    left4: {
      frame: { x: 96, y: 96, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    right: {
      frame: { x: 0, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    right2: {
      frame: { x: 32, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    right3: {
      frame: { x: 64, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    right4: {
      frame: { x: 96, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    up: {
      frame: { x: 128, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    up2: {
      frame: { x: 160, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    up3: {
      frame: { x: 192, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    up4: {
      frame: { x: 224, y: 128, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    down: {
      frame: { x: 128, y: 32, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    down2: {
      frame: { x: 160, y: 32, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    down3: {
      frame: { x: 192, y: 32, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
    down4: {
      frame: { x: 224, y: 32, w: 32, h: 32 },
      sourceSize: { w: 32, h: 32 },
      spriteSourceSize: { x: 0, y: 0 },
    },
  },
  meta: {
    scale: '1',
  },
  animations: {
    left: ['left', 'left2', 'left3','left4'],
    right: ['right', 'right2', 'right3','right4'],
    up:['up', 'up2', 'up3','up4'],
    down:  ['down', 'down2', 'down3','down4'],
  },
};