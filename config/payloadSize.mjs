import { json } from "express";

export const smallBody = json({ limit: "5kb" });
export const mediumBody = json({limit: "150kb"})
export const largeBody = json({ limit: "500kb" });