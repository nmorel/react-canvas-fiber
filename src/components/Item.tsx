import * as React from "react";
import { IItem } from "../models/item";
import { SvgItem } from "./SvgItem";
import { BasicItem } from "./BasicItem";

export function Item({ item }: { item: IItem }) {
  switch (item.kind) {
    case "svg":
      return <SvgItem item={item} />;
    default:
      return <BasicItem item={item} />;
  }
}
