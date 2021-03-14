import { View } from "./YogaComponents";

export abstract class HasChildren {
  children: Array<View> = [];

  addChild(child: View) {
    this.children.push(child);
  }

  insertChildBefore(child: View, beforeChild: View) {
    const index = this.children.findIndex((c) => c === beforeChild);
    this.children.splice(index, 0, child);
    return index;
  }

  removeChild(child: View) {
    const index = this.children.findIndex((c) => c === child);
    this.children.splice(index, 1);
  }
}
