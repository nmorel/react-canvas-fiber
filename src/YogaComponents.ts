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
} from "yoga-layout-prebuilt";
import { DimensionValue, TextStyle, ViewStyle } from "./Style";

const flexDirectionToYoga: Record<
  ViewStyle["flexDirection"],
  YogaFlexDirection
> = {
  row: FLEX_DIRECTION_ROW,
  "row-reverse": FLEX_DIRECTION_ROW_REVERSE,
  column: FLEX_DIRECTION_COLUMN,
  "column-reverse": FLEX_DIRECTION_COLUMN_REVERSE,
};

const flexWrapToYoga: Record<ViewStyle["flexWrap"], YogaFlexWrap> = {
  wrap: WRAP_WRAP,
  nowrap: WRAP_NO_WRAP,
  "wrap-reverse": WRAP_WRAP_REVERSE,
};

const overflowToYoga: Record<ViewStyle["overflow"], YogaOverflow> = {
  hidden: OVERFLOW_HIDDEN,
  visible: OVERFLOW_VISIBLE,
  scroll: OVERFLOW_SCROLL,
};

const positionToYoga: Record<ViewStyle["position"], YogaPositionType> = {
  relative: POSITION_TYPE_RELATIVE,
  absolute: POSITION_TYPE_ABSOLUTE,
};

const justifyContentToYoga: Record<
  ViewStyle["justifyContent"],
  YogaJustifyContent
> = {
  "flex-start": JUSTIFY_FLEX_START,
  "flex-end": JUSTIFY_FLEX_END,
  center: JUSTIFY_CENTER,
  "space-between": JUSTIFY_SPACE_BETWEEN,
  "space-around": JUSTIFY_SPACE_AROUND,
  "space-evenly": JUSTIFY_SPACE_EVENLY,
};

const alignItemsToYoga: Record<ViewStyle["alignItems"], YogaAlign> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  baseline: ALIGN_BASELINE,
};

const alignSelfToYoga: Record<ViewStyle["alignSelf"], YogaAlign> = {
  auto: ALIGN_AUTO,
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  baseline: ALIGN_BASELINE,
};

const alignContentToYoga: Record<ViewStyle["alignContent"], YogaAlign> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  "space-between": ALIGN_SPACE_BETWEEN,
  "space-around": ALIGN_SPACE_AROUND,
};

export class Base<Style extends ViewStyle> {
  node: YogaNode;
  children: Base<any>[];
  style: Style;

  constructor({ style, children }) {
    this.node = Node.create();
    this.children = children || [];
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

    this.children.map((child, index) =>
      this.node.insertChild(child.node, index)
    );
  }

  setMargin(edge: YogaEdge, margin: DimensionValue) {
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
      ctx.globalAlpha = this.style.opacity
    }

    if (this.style.backgroundColor) {
      ctx.beginPath();
      ctx.rect(
        this.node.getComputedLeft(),
        this.node.getComputedTop(),
        this.node.getComputedWidth(),
        this.node.getComputedHeight()
      );
      ctx.fillStyle = this.style.backgroundColor;
      ctx.fill();
    }

    if (this.style.borderTopColor || this.style.borderColor) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.node.getComputedWidth(), 0);
      ctx.lineWidth = this.style.borderTopWidth || this.style.borderWidth;
      ctx.strokeStyle = this.style.borderTopColor || this.style.borderColor;
      ctx.stroke();
    }
    if (this.style.borderLeftColor || this.style.borderColor) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.node.getComputedHeight());
      ctx.lineWidth = this.style.borderLeftWidth || this.style.borderWidth;
      ctx.strokeStyle = this.style.borderLeftColor || this.style.borderColor;
      ctx.stroke();
    }
    if (this.style.borderBottomColor || this.style.borderColor) {
      ctx.beginPath();
      ctx.moveTo(0, this.node.getComputedHeight());
      ctx.lineTo(this.node.getComputedWidth(), this.node.getComputedHeight());
      ctx.lineWidth = this.style.borderBottomWidth || this.style.borderWidth;
      ctx.strokeStyle = this.style.borderBottomColor || this.style.borderColor;
      ctx.stroke();
    }
    if (this.style.borderRightColor || this.style.borderColor) {
      ctx.beginPath();
      ctx.moveTo(this.node.getComputedWidth(), 0);
      ctx.lineTo(this.node.getComputedWidth(), this.node.getComputedHeight());
      ctx.lineWidth = this.style.borderRightWidth || this.style.borderWidth;
      ctx.strokeStyle = this.style.borderRightColor || this.style.borderColor;
      ctx.stroke();
    }

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
}

export class Text extends Base<TextStyle> {
  text: string;

  constructor({
    text,
    ...props
  }: {
    text: string;
    style: TextStyle;
    children: Base<any>[];
  }) {
    super(props);
    this.text = text;
    this.node.setMeasureFunc(() => {
      // TODO add real measurement
      const canvas = new OffscreenCanvas(1000, 1000);
      const ctx = canvas.getContext("2d");
      ctx.font = `${this.style.fontSize ?? 16}px sans-serif`;
      const metrics = ctx.measureText(text);
      return {
        width: metrics.width,
        height: props.style.fontSize ?? 16,
      };
    });
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
