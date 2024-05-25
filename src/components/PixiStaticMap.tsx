import { PixiComponent, applyDefaultProps } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite, WorldMap, TileLayer } from '../../convex/aiTown/worldMap';
import * as campfire from '../../data/animations/campfire.json';
import * as gentlesparkle from '../../data/animations/gentlesparkle.json';
import * as gentlewaterfall from '../../data/animations/gentlewaterfall.json';
import * as gentlesplash from '../../data/animations/gentlesplash.json';
import * as windmill from '../../data/animations/windmill.json';
import React from 'react';

export type MapProps = {
  map: WorldMap;
  [k: string]: any;
};

const animations = {
  'campfire.json': { spritesheet: campfire, url: '/ai-town/assets/spritesheets/campfire.png' },
  'gentlesparkle.json': {
    spritesheet: gentlesparkle,
    url: '/ai-town/assets/spritesheets/gentlesparkle32.png',
  },
  'gentlewaterfall.json': {
    spritesheet: gentlewaterfall,
    url: '/ai-town/assets/spritesheets/gentlewaterfall32.png',
  },
  'windmill.json': { spritesheet: windmill, url: '/ai-town/assets/spritesheets/windmill.png' },
  'gentlesplash.json': { spritesheet: gentlesplash,
    url: '/ai-town/assets/spritesheets/gentlewaterfall32.png',},
};

const createTiles = (map: WorldMap) => {
  const numxtiles = Math.floor(map.tileSetDimX / map.tileDim);
  const numytiles = Math.floor(map.tileSetDimY / map.tileDim);
  const bt = PIXI.BaseTexture.from(map.tileSetUrl, {
    scaleMode: PIXI.SCALE_MODES.NEAREST,
  });

  const tiles = [];
  for (let x = 0; x < numxtiles; x++) {
    for (let y = 0; y < numytiles; y++) {
      tiles[x + y * numxtiles] = new PIXI.Texture(
        bt,
        new PIXI.Rectangle(x * map.tileDim, y * map.tileDim, map.tileDim, map.tileDim),
      );
    }
  }
  return tiles;
};

const renderMap = (container: PIXI.Container, map:WorldMap, tiles: PIXI.Texture[]) => {
  const screenxtiles = map.bgTiles[0].length;
  const screenytiles = map.bgTiles[0][0].length;

  const allLayers = [...map.bgTiles, ...map.objectTiles, ...map.decorTiles];

  // blit bg & object layers of map onto canvas
  for (let i = 0; i < screenxtiles * screenytiles; i++) {
    const x = i % screenxtiles;
    const y = Math.floor(i / screenxtiles);
    const xPx = x * map.tileDim;
    const yPx = y * map.tileDim;

    // Add all layers of backgrounds.
    for (const layer of allLayers) {
      const tileIndex = layer[x][y];
      // Some layers may not have tiles at this location.
      if (tileIndex === -1) continue;
      const ctile = new PIXI.Sprite(tiles[tileIndex]);
      ctile.x = xPx;
      ctile.y = yPx;
      container.addChild(ctile);
    }
  }
};

const createAnimatedSprites = (container: PIXI.Container, map: WorldMap) => {
  const spritesBySheet = new Map<string, AnimatedSprite[]>();
  for (const sprite of map.animatedSprites) {
    const sheet = sprite.sheet;
    if (!spritesBySheet.has(sheet)) {
      spritesBySheet.set(sheet, []);
    }
    spritesBySheet.get(sheet)!.push(sprite);
  }

  for (const [sheet, sprites] of spritesBySheet.entries()) {
    const animation = (animations as any)[sheet];
    if (!animation) {
      console.error('Could not find animation', sheet);
      continue;
    }
    const { spritesheet, url } = animation;
    const texture = PIXI.BaseTexture.from(url, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });
    const spriteSheet = new PIXI.Spritesheet(texture, spritesheet);
    spriteSheet.parse().then(() => {
      for (const sprite of sprites) {
        const pixiAnimation = spriteSheet.animations[sprite.animation];
        if (!pixiAnimation) {
          console.error('Failed to load animation', sprite);
          continue;
        }
        const pixiSprite = new PIXI.AnimatedSprite(pixiAnimation);
        pixiSprite.animationSpeed = 0.1;
        pixiSprite.autoUpdate = true;
        pixiSprite.x = sprite.x;
        pixiSprite.y = sprite.y;
        pixiSprite.width = sprite.w;
        pixiSprite.height = sprite.h;
        container.addChild(pixiSprite);
        pixiSprite.play();
      }
    });
  }
};

export const PixiStaticMapComponent = PixiComponent('StaticMap', {
  create: (props: { map: WorldMap; [k: string]: any }) => {
    const container = new PIXI.Container();
    const tiles = createTiles(props.map);
    renderMap(container, props.map, tiles);
    createAnimatedSprites(container, props.map);

    container.x = 0;
    container.y = 0;

    // Set the hit area manually to ensure `pointerdown` events are delivered to this container.
    const screenxtiles = props.map.bgTiles[0].length;
    const screenytiles = props.map.bgTiles[0][0].length;
    container.interactive = true;
    container.hitArea = new PIXI.Rectangle(
      0,
      0,
      screenxtiles * props.map.tileDim,
      screenytiles * props.map.tileDim,
    );

    return container;
  },

  applyProps: (instance, oldProps: any, newProps: any) => {
    if (oldProps.map !== newProps.map) {
      instance.removeChildren();
      const tiles = createTiles(newProps.map);
      renderMap(instance, newProps.map, tiles);
      createAnimatedSprites(instance, newProps.map);
    }

    applyDefaultProps(instance, oldProps, newProps);
  },
});

const PixiStaticMap = React.memo(
  (props: MapProps) => {
    return <PixiStaticMapComponent {...props} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.map.bgTiles === nextProps.map.bgTiles &&
      prevProps.map.objectTiles === nextProps.map.objectTiles
    );
  }
);

export default PixiStaticMap;
