import { action, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

export abstract class Item {
  id: string;
  left: number = 0;
  top: number = 0;
  width: number = 300;
  scale: number = 1;
  color: string = "yellow";

  constructor({ id, ...rest }: Partial<Item>) {
    this.id = id || uuidv4();
    Object.assign(this, rest);

    makeObservable(this, {
      id: observable,
      left: observable,
      top: observable,
      width: observable,
      scale: observable,
      color: observable,
      set: action,
    });
  }

  set(data: Partial<IItem>) {
    Object.assign(this, data);
  }
}

export class TextItem extends Item {
  kind = "text" as const;
  text: string;

  constructor({ text, ...rest }: Partial<TextItem> & { text: string }) {
    super(rest);
    this.text = text;

    makeObservable(this, {
      text: observable,
    });
  }
}

export class ImageItem extends Item {
  kind = "image" as const;
  imageUrl: string;
  placeholderUrl?: string;

  constructor({
    imageUrl,
    placeholderUrl,
    ...rest
  }: Partial<ImageItem> & { imageUrl: string }) {
    super(rest);
    this.imageUrl = imageUrl;
    this.placeholderUrl = placeholderUrl;

    makeObservable(this, {
      imageUrl: observable,
      placeholderUrl: observable,
    });
  }
}

export type IItem = TextItem | ImageItem;
