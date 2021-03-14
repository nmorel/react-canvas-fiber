import { ReactNode, Ref } from "react";
import {
  ViewProps,
  TextProps,
  ImageProps,
  View,
  Image,
  Text,
} from "./YogaComponents";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "c-view": ViewProps & {
        ref?: Ref<View>;
        children?: ReactNode;
      };
      "c-text": TextProps & {
        ref?: Ref<Text>;
        children?: ReactNode;
      };
      "c-image": ImageProps & {
        ref?: Ref<Image>;
        children?: ReactNode;
      };
    }
  }
}
