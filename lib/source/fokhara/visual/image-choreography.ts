import type { CSSProperties } from "react";

export type ProductVisualRole =
  | "home"
  | "browse"
  | "collection"
  | "detail"
  | "bridge"
  | "cart";

export type WorkshopVisualRole = "home" | "index" | "detail";

export type WorkshopImageTruth =
  | "action"
  | "outcome"
  | "process-context"
  | "human-context";

type ImageFrame = {
  fit: "contain" | "cover";
  position: string;
  scale: number;
  origin?: string;
};

const productFrames: Record<ProductVisualRole, ImageFrame> = {
  home: {
    fit: "cover",
    position: "50% 55%",
    scale: 1.055,
    origin: "50% 55%"
  },
  browse: {
    fit: "cover",
    position: "50% 54%",
    scale: 1.035,
    origin: "50% 54%"
  },
  collection: {
    fit: "cover",
    position: "50% 55%",
    scale: 1.025,
    origin: "50% 55%"
  },
  detail: {
    fit: "contain",
    position: "50% 52%",
    scale: 1.015,
    origin: "50% 52%"
  },
  bridge: {
    fit: "cover",
    position: "50% 54%",
    scale: 1.035,
    origin: "50% 54%"
  },
  cart: {
    fit: "contain",
    position: "50% 50%",
    scale: 1,
    origin: "50% 50%"
  }
};

const workshopTruth: Record<string, WorkshopImageTruth> = {
  handbuilding: "outcome",
  wheelthrowing: "process-context",
  "short-course": "action",
  "make-paint": "action",
  "family-time": "human-context"
};

const defaultWorkshopFrame: Record<WorkshopVisualRole, ImageFrame> = {
  home: {
    fit: "cover",
    position: "50% 50%",
    scale: 1.02
  },
  index: {
    fit: "cover",
    position: "50% 50%",
    scale: 1.015
  },
  detail: {
    fit: "cover",
    position: "50% 50%",
    scale: 1
  }
};

const workshopFrames: Record<
  string,
  Partial<Record<WorkshopVisualRole, ImageFrame>>
> = {
  handbuilding: {
    index: { fit: "cover", position: "50% 53%", scale: 1.02 },
    detail: { fit: "cover", position: "50% 55%", scale: 1.01 }
  },
  wheelthrowing: {
    home: { fit: "cover", position: "50% 48%", scale: 1.025 },
    index: { fit: "cover", position: "50% 49%", scale: 1.02 },
    detail: { fit: "cover", position: "50% 53%", scale: 1.015 }
  },
  "short-course": {
    index: { fit: "cover", position: "43% 51%", scale: 1.025 },
    detail: { fit: "cover", position: "42% 53%", scale: 1.02 }
  },
  "make-paint": {
    index: { fit: "cover", position: "52% 56%", scale: 1.035 },
    detail: { fit: "cover", position: "54% 62%", scale: 1.05 }
  },
  "family-time": {
    index: { fit: "cover", position: "50% 47%", scale: 1.01 },
    detail: { fit: "cover", position: "50% 45%", scale: 1 }
  }
};

function frameCssVars(frame: ImageFrame): CSSProperties {
  return {
    "--image-fit": frame.fit,
    "--image-position": frame.position,
    "--image-scale": String(frame.scale),
    "--image-origin": frame.origin ?? frame.position
  } as CSSProperties;
}

export function productImageChoreography(role: ProductVisualRole): CSSProperties {
  return frameCssVars(productFrames[role]);
}

export function workshopImageChoreography(
  workshopId: string,
  role: WorkshopVisualRole
): CSSProperties {
  return frameCssVars(
    workshopFrames[workshopId]?.[role] ?? defaultWorkshopFrame[role]
  );
}

export function workshopImageTruth(workshopId: string): WorkshopImageTruth {
  return workshopTruth[workshopId] ?? "process-context";
}
