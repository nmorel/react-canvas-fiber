import { action, makeObservable, observable } from "mobx";
import { SVGPathData } from "svg-pathdata";
import { SVGCommand } from "svg-pathdata/lib/types";
import { v4 as uuidv4 } from "uuid";

export abstract class Item {
  id: string;
  left: number = 0;
  top: number = 0;
  scale: number = 1;

  constructor({ id, ...rest }: Partial<Item>) {
    this.id = id || uuidv4();
    Object.assign(this, rest);

    makeObservable(this, {
      id: observable,
      left: observable,
      top: observable,
      scale: observable,
      set: action,
    });
  }

  set(data: Partial<IItem>) {
    Object.assign(this, data);
  }
}
export abstract class BasicItem extends Item {
  width: number;
  color: string;

  constructor({ width = 300, color = "#7FB285", ...rest }: Partial<BasicItem>) {
    super(rest);
    this.width = width;
    this.color = color;

    makeObservable(this, {
      width: observable,
      color: observable,
    });
  }
}

export class TextItem extends BasicItem {
  kind = "text" as const;
  text: string;

  constructor({ text, ...rest }: Partial<TextItem> & Pick<TextItem, "text">) {
    super(rest);
    this.text = text;

    makeObservable(this, {
      text: observable,
    });
  }
}

export class ImageItem extends BasicItem {
  kind = "image" as const;
  imageUrl: string;
  placeholderUrl?: string;

  constructor({
    imageUrl,
    placeholderUrl,
    ...rest
  }: Partial<ImageItem> & Pick<ImageItem, "imageUrl">) {
    super(rest);
    this.imageUrl = imageUrl;
    this.placeholderUrl = placeholderUrl;

    makeObservable(this, {
      imageUrl: observable,
      placeholderUrl: observable,
    });
  }
}

export class SvgItem extends Item {
  kind = "svg" as const;
  path: string;
  width: number;
  height: number;
  commands: SVGCommand[];
  strokeWidth = 2;
  color = "red";

  constructor({ path, ...rest }: Partial<SvgItem> & Pick<SvgItem, "path">) {
    super(rest);
    this.path = path;
    const pathData = new SVGPathData(path);
    const bounds = pathData.getBounds();
    this.width = bounds.maxX - bounds.minX;
    this.height = bounds.maxY - bounds.minY;
    this.commands = pathData.commands;

    makeObservable(this, {
      path: observable,
    });
  }
}

export type IItem = TextItem | ImageItem | SvgItem;
