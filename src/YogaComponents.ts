import {
  EDGE_ALL,
  EDGE_BOTTOM,
  EDGE_HORIZONTAL,
  EDGE_LEFT,
  EDGE_RIGHT,
  EDGE_TOP,
  EDGE_VERTICAL,
  Node,
  JUSTIFY_SPACE_BETWEEN,
  YogaNode,
  YogaFlexDirection,
  FLEX_DIRECTION_ROW,
  FLEX_DIRECTION_ROW_REVERSE,
  FLEX_DIRECTION_COLUMN,
  FLEX_DIRECTION_COLUMN_REVERSE,
  YogaFlexWrap,
  WRAP_WRAP,
  WRAP_NO_WRAP,
  WRAP_WRAP_REVERSE,
  YogaOverflow,
  OVERFLOW_HIDDEN,
  OVERFLOW_VISIBLE,
  OVERFLOW_SCROLL,
  YogaPositionType,
  POSITION_TYPE_RELATIVE,
  POSITION_TYPE_ABSOLUTE,
  YogaJustifyContent,
  JUSTIFY_FLEX_START,
  JUSTIFY_FLEX_END,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_AROUND,
  JUSTIFY_SPACE_EVENLY,
  YogaAlign,
  ALIGN_FLEX_START,
  ALIGN_FLEX_END,
  ALIGN_CENTER,
  ALIGN_STRETCH,
  ALIGN_BASELINE,
  ALIGN_AUTO,
  ALIGN_SPACE_BETWEEN,
  ALIGN_SPACE_AROUND,
  YogaEdge,
  DIRECTION_LTR,
} from "yoga-layout-prebuilt";
import { HasChildren } from "./HasChildren";
import { DimensionValue, TextStyle, ViewStyle } from "./Style";

const flexDirectionToYoga: Record<
  Exclude<ViewStyle["flexDirection"], undefined>,
  YogaFlexDirection
> = {
  row: FLEX_DIRECTION_ROW,
  "row-reverse": FLEX_DIRECTION_ROW_REVERSE,
  column: FLEX_DIRECTION_COLUMN,
  "column-reverse": FLEX_DIRECTION_COLUMN_REVERSE,
};

const flexWrapToYoga: Record<
  Exclude<ViewStyle["flexWrap"], undefined>,
  YogaFlexWrap
> = {
  wrap: WRAP_WRAP,
  nowrap: WRAP_NO_WRAP,
  "wrap-reverse": WRAP_WRAP_REVERSE,
};

const overflowToYoga: Record<
  Exclude<ViewStyle["overflow"], undefined>,
  YogaOverflow
> = {
  hidden: OVERFLOW_HIDDEN,
  visible: OVERFLOW_VISIBLE,
  scroll: OVERFLOW_SCROLL,
};

const positionToYoga: Record<
  Exclude<ViewStyle["position"], undefined>,
  YogaPositionType
> = {
  relative: POSITION_TYPE_RELATIVE,
  absolute: POSITION_TYPE_ABSOLUTE,
};

const justifyContentToYoga: Record<
  Exclude<ViewStyle["justifyContent"], undefined>,
  YogaJustifyContent
> = {
  "flex-start": JUSTIFY_FLEX_START,
  "flex-end": JUSTIFY_FLEX_END,
  center: JUSTIFY_CENTER,
  "space-between": JUSTIFY_SPACE_BETWEEN,
  "space-around": JUSTIFY_SPACE_AROUND,
  "space-evenly": JUSTIFY_SPACE_EVENLY,
};

const alignItemsToYoga: Record<
  Exclude<ViewStyle["alignItems"], undefined>,
  YogaAlign
> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  baseline: ALIGN_BASELINE,
};

const alignSelfToYoga: Record<
  Exclude<ViewStyle["alignSelf"], undefined>,
  YogaAlign
> = {
  auto: ALIGN_AUTO,
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  baseline: ALIGN_BASELINE,
};

const alignContentToYoga: Record<
  Exclude<ViewStyle["alignContent"], undefined>,
  YogaAlign
> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  "space-between": ALIGN_SPACE_BETWEEN,
  "space-around": ALIGN_SPACE_AROUND,
};

export class View<Style extends ViewStyle> extends HasChildren {
  node: YogaNode;
  children: View<any>[];
  style: Style;

  constructor({ style }: { style: Style }) {
    super();

    this.node = Node.create();
    this.children = [];
    this.style = style;

    this.layout();
  }

  update({ style }: { style: Style }) {
    this.style = style;
    this.layout();
  }

  layout() {
    if (this.style.display === "none") return;

    // Width
    if (this.style.width != null) {
      this.node.setWidth(this.style.width);
    }
    if (this.style.maxWidth != null) {
      this.node.setMaxWidth(this.style.maxWidth);
    }
    if (this.style.minWidth != null) {
      this.node.setMinWidth(this.style.minWidth);
    }

    // Height
    if (this.style.height != null) {
      this.node.setHeight(this.style.height);
    }
    if (this.style.maxHeight != null) {
      this.node.setMaxHeight(this.style.maxHeight);
    }
    if (this.style.minHeight != null) {
      this.node.setMinHeight(this.style.minHeight);
    }

    // Flex
    if (this.style.flex != null) {
      this.node.setFlex(this.style.flex);
    }
    if (this.style.flexBasis != null) {
      this.node.setFlexBasis(this.style.flexBasis);
    }
    if (this.style.flexDirection != null) {
      this.node.setFlexDirection(flexDirectionToYoga[this.style.flexDirection]);
    }
    if (this.style.flexGrow != null) {
      this.node.setFlexGrow(this.style.flexGrow);
    }
    if (this.style.flexShrink != null) {
      this.node.setFlexShrink(this.style.flexShrink);
    }
    if (this.style.flexWrap != null) {
      this.node.setFlexWrap(flexWrapToYoga[this.style.flexWrap]);
    }

    // Aspect Ratio
    if (this.style.aspectRatio != null) {
      this.node.setAspectRatio(this.style.aspectRatio);
    }

    // Overflow
    if (this.style.overflow != null) {
      this.node.setOverflow(overflowToYoga[this.style.overflow]);
    }

    // Position
    if (this.style.position != null) {
      this.node.setPositionType(positionToYoga[this.style.position]);
    }
    if (this.style.left != null) {
      this.node.setPosition(EDGE_LEFT, this.style.left);
    }
    if (this.style.top != null) {
      this.node.setPosition(EDGE_TOP, this.style.top);
    }
    if (this.style.right != null) {
      this.node.setPosition(EDGE_RIGHT, this.style.right);
    }
    if (this.style.bottom != null) {
      this.node.setPosition(EDGE_BOTTOM, this.style.bottom);
    }

    // Justify & Align
    if (this.style.justifyContent != null) {
      this.node.setJustifyContent(
        justifyContentToYoga[this.style.justifyContent]
      );
    }
    if (this.style.alignItems != null) {
      this.node.setAlignItems(alignItemsToYoga[this.style.alignItems]);
    }
    if (this.style.alignSelf != null) {
      this.node.setAlignSelf(alignSelfToYoga[this.style.alignSelf]);
    }
    if (this.style.alignContent != null) {
      this.node.setAlignContent(alignContentToYoga[this.style.alignContent]);
    }

    // Padding
    if (this.style.padding != null) {
      this.node.setPadding(EDGE_ALL, this.style.padding);
    }
    if (this.style.paddingBottom != null) {
      this.node.setPadding(EDGE_BOTTOM, this.style.paddingBottom);
    }
    if (this.style.paddingHorizontal != null) {
      this.node.setPadding(EDGE_HORIZONTAL, this.style.paddingHorizontal);
    }
    if (this.style.paddingLeft != null) {
      this.node.setPadding(EDGE_LEFT, this.style.paddingLeft);
    }
    if (this.style.paddingRight != null) {
      this.node.setPadding(EDGE_RIGHT, this.style.paddingRight);
    }
    if (this.style.paddingTop != null) {
      this.node.setPadding(EDGE_TOP, this.style.paddingTop);
    }
    if (this.style.paddingVertical != null) {
      this.node.setPadding(EDGE_VERTICAL, this.style.paddingVertical);
    }

    // Margin
    this.setMargin(EDGE_ALL, this.style.margin);
    this.setMargin(EDGE_BOTTOM, this.style.marginBottom);
    this.setMargin(EDGE_HORIZONTAL, this.style.marginHorizontal);
    this.setMargin(EDGE_LEFT, this.style.marginLeft);
    this.setMargin(EDGE_RIGHT, this.style.marginRight);
    this.setMargin(EDGE_TOP, this.style.marginTop);
    this.setMargin(EDGE_VERTICAL, this.style.marginVertical);
  }

  setMargin(edge: YogaEdge, margin: DimensionValue | null | undefined) {
    if (margin == null) {
      return;
    }

    if (margin === "auto") {
      this.node.setMarginAuto(edge);
    } else if (typeof margin === "number") {
      this.node.setMargin(edge, margin);
    } else {
      const [, num, type] = /^([0-9]+)(%|px)$/i.exec(margin) || [];
      if (!type) {
        console.error("invalida margin", margin);
      }
      const value = parseFloat(num);
      if (type === "%") {
        this.node.setMarginPercent(edge, value);
      } else {
        this.node.setMargin(edge, value);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.style.display === "none") return;

    if (this.node.isDirty()) {
      this.node.calculateLayout(void 0, void 0, DIRECTION_LTR);
    }

    ctx.save();

    if (this.style.transform) {
      ctx.transform(
        this.style.transform.scaleX ??
          this.style.transform.scale ??
          this.style.transform.matrix?.[0] ??
          1,
        this.style.transform.skewX ?? this.style.transform.matrix?.[1] ?? 0,
        this.style.transform.skewY ?? this.style.transform.matrix?.[2] ?? 0,
        this.style.transform.scaleY ??
          this.style.transform.scale ??
          this.style.transform.matrix?.[3] ??
          0,
        this.style.transform.translateX ??
          this.style.transform.translate?.[0] ??
          this.style.transform.matrix?.[4] ??
          0,
        this.style.transform.translateY ??
          this.style.transform.translate?.[1] ??
          this.style.transform.matrix?.[5] ??
          0
      );
    }

    if (this.style.opacity != null) {
      ctx.globalAlpha = this.style.opacity;
    }

    const borderTopLeftRadius =
      this.style.borderTopLeftRadius || this.style.borderRadius;
    const borderTopRightRadius =
      this.style.borderTopRightRadius || this.style.borderRadius;
    const borderBottomLeftRadius =
      this.style.borderBottomLeftRadius || this.style.borderRadius;
    const borderBottomRightRadius =
      this.style.borderBottomRightRadius || this.style.borderRadius;

    const top = this.node.getComputedTop();
    const left = this.node.getComputedLeft();
    const right = left + this.node.getComputedWidth();
    const bottom = top + this.node.getComputedHeight();

    if (this.style.backgroundColor || this.style.borderColor) {
      if (
        borderTopLeftRadius ||
        borderTopRightRadius ||
        borderBottomLeftRadius ||
        borderBottomRightRadius
      ) {
        ctx.beginPath();
        if (borderTopLeftRadius) {
          ctx.moveTo(left, top + borderTopLeftRadius);
          ctx.quadraticCurveTo(left, top, left + borderTopLeftRadius, top);
        } else {
          ctx.moveTo(left, top);
        }
        if (borderTopRightRadius) {
          ctx.lineTo(right - borderTopRightRadius, top);
          ctx.quadraticCurveTo(right, top, right, top + borderTopRightRadius);
        } else {
          ctx.lineTo(right, top);
        }
        if (borderBottomRightRadius) {
          ctx.lineTo(right, bottom - borderBottomRightRadius);
          ctx.quadraticCurveTo(
            right,
            bottom,
            right - borderBottomRightRadius,
            bottom
          );
        } else {
          ctx.lineTo(right, bottom);
        }
        if (borderBottomLeftRadius) {
          ctx.lineTo(left + borderBottomLeftRadius, bottom);
          ctx.quadraticCurveTo(
            left,
            bottom,
            left,
            bottom - borderBottomLeftRadius
          );
        } else {
          ctx.lineTo(left, bottom);
        }
        if (borderTopLeftRadius) {
          ctx.lineTo(left, top + borderTopLeftRadius);
        } else {
          ctx.lineTo(left, top);
        }
      } else {
        ctx.beginPath();
        ctx.rect(
          this.node.getComputedLeft(),
          this.node.getComputedTop(),
          this.node.getComputedWidth(),
          this.node.getComputedHeight()
        );
      }
      if (this.style.backgroundColor) {
        ctx.fillStyle = this.style.backgroundColor;
        ctx.fill();
      }
      // TODO handle borderTop/Left/Right/Bottom override
      if (this.style.borderColor) {
        ctx.lineWidth = this.style.borderWidth || 1;
        ctx.strokeStyle = this.style.borderColor;
        ctx.stroke();
      }
    }

    // TODO handle borderTop/Left/Right/Bottom override
    // if (this.style.borderTopColor || this.style.borderColor) {
    //   ctx.beginPath();
    //   ctx.moveTo(left, top);
    //   ctx.lineTo(right, top);
    //   ctx.lineWidth = this.style.borderTopWidth || this.style.borderWidth || 0;
    //   ctx.strokeStyle =
    //     this.style.borderTopColor || this.style.borderColor || "";
    //   ctx.stroke();
    // }
    // if (this.style.borderLeftColor || this.style.borderColor) {
    //   ctx.beginPath();
    //   ctx.moveTo(left, top);
    //   ctx.lineTo(left, bottom);
    //   ctx.lineWidth = this.style.borderLeftWidth || this.style.borderWidth || 0;
    //   ctx.strokeStyle =
    //     this.style.borderLeftColor || this.style.borderColor || "";
    //   ctx.stroke();
    // }
    // if (this.style.borderBottomColor || this.style.borderColor) {
    //   ctx.beginPath();
    //   ctx.moveTo(left, bottom);
    //   ctx.lineTo(right, bottom);
    //   ctx.lineWidth =
    //     this.style.borderBottomWidth || this.style.borderWidth || 0;
    //   ctx.strokeStyle =
    //     this.style.borderBottomColor || this.style.borderColor || "";
    //   ctx.stroke();
    // }
    // if (this.style.borderRightColor || this.style.borderColor) {
    //   ctx.beginPath();
    //   ctx.moveTo(right, top);
    //   ctx.lineTo(right, bottom);
    //   ctx.lineWidth =
    //     this.style.borderRightWidth || this.style.borderWidth || 0;
    //   ctx.strokeStyle =
    //     this.style.borderRightColor || this.style.borderColor || "";
    //   ctx.stroke();
    // }

    this.renderContent(ctx);

    // Move the current transform to match padding/margin so children can start at pos (0, 0)
    if (
      this.children.length &&
      (this.node.getComputedLeft() || this.node.getComputedTop())
    ) {
      ctx.transform(
        1,
        0,
        0,
        1,
        this.node.getComputedLeft(),
        this.node.getComputedTop()
      );
    }

    this.children.forEach((child) => child.render(ctx));

    ctx.restore();
  }

  renderContent(ctx: CanvasRenderingContext2D) {}

  addChild(child: View<any>) {
    super.addChild(child);
    this.node.insertChild(child.node, this.children.length - 1);
  }

  insertChildBefore(child: View<any>, beforeChild: View<any>) {
    const index = super.insertChildBefore(child, beforeChild);
    this.node.insertChild(child.node, index);
    return index;
  }

  removeChild(child: View<any>) {
    super.removeChild(child);
    this.node.removeChild(child.node);
  }
}

export class Text extends View<TextStyle> {
  text: string;

  constructor({ text, ...props }: { text: string; style: TextStyle }) {
    super(props);
    this.text = text;
    this.node.setMeasureFunc(() => {
      // TODO add real measurement
      const canvas = new OffscreenCanvas(1000, 1000);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = `${this.style.fontSize ?? 16}px sans-serif`;
      }
      const metrics = ctx?.measureText(text);
      return {
        width: metrics?.width || 0,
        height: props.style.fontSize ?? 16,
      };
    });
  }

  update(props: { style: TextStyle; text: string }) {
    this.text = props.text;
    super.update(props);
  }

  renderContent(ctx: CanvasRenderingContext2D) {
    ctx.textBaseline = "top";
    ctx.fillStyle = this.style.color ?? "black";
    ctx.font = `${this.style.fontSize ?? 16}px sans-serif`;
    ctx.fillText(
      this.text,
      this.node.getComputedLeft(),
      this.node.getComputedTop()
    );
  }
}

export class Image extends View<ViewStyle> {
  image: HTMLImageElement;

  constructor({
    image,
    ...props
  }: {
    image: HTMLImageElement;
    style: ViewStyle;
  }) {
    super(props);
    this.image = image;
  }

  update(props: { style: TextStyle; image: HTMLImageElement }) {
    this.image = props.image;
    super.update(props);
  }

  renderContent(ctx: CanvasRenderingContext2D) {
    const cw = this.node.getComputedWidth();
    const ch = this.node.getComputedHeight();
    const ratioContainer = cw / ch;
    const iw = this.image.width;
    const ih = this.image.height;
    const ratioImg = iw / ih;
    let dw: number;
    let dh: number;
    if (iw >= ih) {
      dw = cw / (ratioContainer / ratioImg);
      dh = dw / ratioImg;
    } else {
      dh = ch / (ratioContainer / ratioImg);
      dw = dh / ratioImg;
    }

    ctx.drawImage(
      this.image,
      this.node.getComputedLeft() + (cw - dw) / 2,
      this.node.getComputedTop() + (ch - dh) / 2,
      dw,
      dh
    );
  }
}
