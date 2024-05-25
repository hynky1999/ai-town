import { Infer, ObjectType, v } from 'convex/values';

// `layer[position.x][position.y]` is the tileIndex or -1 if empty.
const tileLayer = v.array(v.array(v.number()));
export type TileLayer = Infer<typeof tileLayer>;

const animatedSprite = {
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
  layer: v.number(),
  sheet: v.string(),
  animation: v.string(),
};
export type AnimatedSprite = ObjectType<typeof animatedSprite>;

export const serializedWorldMap = {
  width: v.number(),
  height: v.number(),

  tileSetUrl: v.string(),
  //  Width & height of tileset image, px.
  tileSetDimX: v.number(),
  tileSetDimY: v.number(),

  // Tile size in pixels (assume square)
  tileDim: v.number(),
  bgTiles: v.array(v.array(v.array(v.number()))),
  decorTiles: v.array(v.array(v.array(v.number()))),
  objectTiles: v.array(tileLayer),
  bgTilesN: v.array(v.array(v.array(v.number()))),
  decorTilesN: v.array(v.array(v.array(v.number()))),
  objectTilesN: v.array(tileLayer),
  animatedSprites: v.array(v.object(animatedSprite)),
};
export type SerializedWorldMap = ObjectType<typeof serializedWorldMap>;

export class WorldMap {
  width: number;
  height: number;

  tileSetUrl: string;
  tileSetDimX: number;
  tileSetDimY: number;

  tileDim: number;

  bgTiles: TileLayer[];
  decorTiles: TileLayer[];
  objectTiles: TileLayer[];
  bgTilesN: TileLayer[];
  decorTilesN: TileLayer[];
  objectTilesN: TileLayer[];
  animatedSprites: AnimatedSprite[];

  constructor(serialized: SerializedWorldMap) {
    this.width = serialized.width;
    this.height = serialized.height;
    this.tileSetUrl = serialized.tileSetUrl;

    this.tileSetDimX = serialized.tileSetDimX;
    this.tileSetDimY = serialized.tileSetDimY;
    this.tileDim = serialized.tileDim;
    this.bgTiles = serialized.bgTiles;
    this.decorTiles = serialized.decorTiles;
    this.objectTiles = serialized.objectTiles;
    this.bgTilesN = serialized.bgTilesN;
    this.decorTilesN = serialized.decorTilesN;
    this.objectTilesN = serialized.objectTilesN;
    this.animatedSprites = serialized.animatedSprites;
  }

  serialize(): SerializedWorldMap {
    return {
      width: this.width,
      height: this.height,
      tileSetUrl: this.tileSetUrl,
      tileSetDimX: this.tileSetDimX,
      tileSetDimY: this.tileSetDimY,
      tileDim: this.tileDim,
      bgTiles: this.bgTiles,
      objectTiles: this.objectTiles,
      decorTiles:this.decorTiles,
      bgTilesN: this.bgTilesN,
      objectTilesN: this.objectTilesN,
      decorTilesN:this.decorTilesN,
      animatedSprites: this.animatedSprites,
    };
  }
}
