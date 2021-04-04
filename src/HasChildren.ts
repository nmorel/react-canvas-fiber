import { View } from "./YogaComponents";

export abstract class HasChildren {
  parent: HasChildren | null = null;
  children: Array<View> = [];

  addChild(child: View) {
    this.children.push(child);
    child.parent = this;
  }

  insertChildBefore(child: View, beforeChild: View) {
    const index = this.children.findIndex((c) => c === beforeChild);
    this.children.splice(index, 0, child);
    child.parent = this;
    return index;
  }

  removeChild(child: View) {
    const index = this.children.findIndex((c) => c === child);
    this.children.splice(index, 1);
    child.parent = null;
  }
}
