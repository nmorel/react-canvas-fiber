import { makeAutoObservable, makeObservable, observable } from "mobx";
import { identityMatrix } from "../constants/defaultValues";
import { IItem, ImageItem, TextItem } from "./item";
import largeImagePlaceholder from "../assets/react.png";
import largeImage from "../assets/large_image_original.jpeg";

export class Store {
  width: number = 0;
  height: number = 0;
  sceneTransformMatrix = identityMatrix;
  items: IItem[] = [];

  constructor() {
    makeAutoObservable(this, {
      sceneTransformMatrix: observable.ref,
    });

    this.loadItems();
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setSceneTransformMatrix(matrix: Store["sceneTransformMatrix"]) {
    this.sceneTransformMatrix = matrix;
  }

  loadItems() {
    const limit = 2000;
    const maxPerColumn = Math.ceil(Math.sqrt(limit));
    let left = 1000;
    let top = 0;
    let i = 0;
    while (i < limit) {
      for (let j = 0; j < maxPerColumn && i < limit; j++) {
        this.items.push(
          new TextItem({
            left,
            top,
            text:
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
          })
        );
        i++;
        top += 180;
      }
      left += 350;
      top = 0;
    }

    this.items.push(
      new TextItem({
        left: 40,
        top: 50,
        color: "#ED6B86",
        text: "😈👿👹👺🤡💩👻💀Hello World !👽👾🤖🎃😺😹😻😼😽",
      }),
      new TextItem({
        left: 40,
        top: 200,
        scale: 0.8,
        color: "#463239",
        text:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
      }),
      new ImageItem({
        left: 400,
        top: 30,
        scale: 1.5,
        color: "#7FB285",
        placeholderUrl: largeImagePlaceholder,
        imageUrl: largeImagePlaceholder,
      })
    );
  }
}
