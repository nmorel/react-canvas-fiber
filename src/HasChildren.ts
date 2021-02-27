import { View } from "./YogaComponents";

export abstract class HasChildren {
  children: Array<View<any>> = [];

  addChild(child: View<any>) {
    this.children.push(child);
  }

  insertChildBefore(child: View<any>, beforeChild: View<any>) {
    const index = this.children.findIndex((c) => c === beforeChild);
    this.children.splice(index, 0, child);
    return index;
  }

  removeChild(child: View<any>) {
    const index = this.children.findIndex((c) => c === child);
    this.children.splice(index, 1);
  }
}
