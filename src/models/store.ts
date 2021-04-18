import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { identityMatrix } from "../constants/defaultValues";
import { IItem, ImageItem, TextItem } from "./item";
import largeImagePlaceholder from "../react.png";
import largeImage from "../large_image_original.jpeg";

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
    this.items.push(
      new TextItem({
        left: 40,
        top: 50,
        color: "green",
        text: "😈👿👹👺🤡💩👻💀Hello World !👽👾🤖🎃😺😹😻😼😽",
      }),
      new TextItem({
        left: 40,
        top: 200,
        scale: 0.8,
        color: "red",
        text:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
      }),
      new ImageItem({
        left: 400,
        top: 30,
        scale: 1.5,
        color: "red",
        placeholderUrl: largeImagePlaceholder,
        imageUrl: largeImagePlaceholder,
      })
    );
  }
}
