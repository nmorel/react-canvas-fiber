import { BaseElement } from "./YogaComponents";

export abstract class HasChildren {
  parent: HasChildren | null = null;
  children: Array<BaseElement> = [];

  addChild(child: BaseElement) {
    this.children.push(child);
    child.parent = this;
  }

  insertChildBefore(child: BaseElement, beforeChild: BaseElement) {
    const index = this.children.findIndex((c) => c === beforeChild);
    this.children.splice(index, 0, child);
    child.parent = this;
    return index;
  }

  removeChild(child: BaseElement) {
    const index = this.children.findIndex((c) => c === child);
    this.children.splice(index, 1);
    child.parent = null;
  }
}
