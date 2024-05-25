import { Sprite, Stage } from "@pixi/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const Cloud = ({
  worldId
}: {
  worldId: Id<"worlds">
}) => {
  return (
    <img src="/ai-town/assets/cloud.jpg" className="absolute  w-full h-full object-cover" />
  )
}

