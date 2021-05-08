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
import { CanvasRenderer } from "./CanvasRenderer";
import { HasChildren } from "./HasChildren";
import {
  DimensionValue,
  ImageStyleProps,
  TextStyleProps,
  ViewStyleProps,
} from "./Style";
import type { TextBreaker } from "../utils/text-breaker";
import { defaultBounds, identityMatrix } from "../constants/defaultValues";

const flexDirectionToYoga: Record<
  Exclude<ViewProps["flexDirection"], undefined>,
  YogaFlexDirection
> = {
  row: FLEX_DIRECTION_ROW,
  "row-reverse": FLEX_DIRECTION_ROW_REVERSE,
  column: FLEX_DIRECTION_COLUMN,
  "column-reverse": FLEX_DIRECTION_COLUMN_REVERSE,
};

const flexWrapToYoga: Record<
  Exclude<ViewProps["flexWrap"], undefined>,
  YogaFlexWrap
> = {
  wrap: WRAP_WRAP,
  nowrap: WRAP_NO_WRAP,
  "wrap-reverse": WRAP_WRAP_REVERSE,
};

const overflowToYoga: Record<
  Exclude<ViewProps["overflow"], undefined>,
  YogaOverflow
> = {
  hidden: OVERFLOW_HIDDEN,
  visible: OVERFLOW_VISIBLE,
  scroll: OVERFLOW_SCROLL,
};

const positionToYoga: Record<
  Exclude<ViewProps["position"], undefined>,
  YogaPositionType
> = {
  relative: POSITION_TYPE_RELATIVE,
  absolute: POSITION_TYPE_ABSOLUTE,
};

const justifyContentToYoga: Record<
  Exclude<ViewProps["justifyContent"], undefined>,
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
  Exclude<ViewProps["alignItems"], undefined>,
  YogaAlign
> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  baseline: ALIGN_BASELINE,
};

const alignSelfToYoga: Record<
  Exclude<ViewProps["alignSelf"], undefined>,
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
  Exclude<ViewProps["alignContent"], undefined>,
  YogaAlign
> = {
  "flex-start": ALIGN_FLEX_START,
  "flex-end": ALIGN_FLEX_END,
  center: ALIGN_CENTER,
  stretch: ALIGN_STRETCH,
  "space-between": ALIGN_SPACE_BETWEEN,
  "space-around": ALIGN_SPACE_AROUND,
};

export type ViewProps = ViewStyleProps & RCF.Handlers;

export class View<Props extends ViewProps = ViewProps> extends HasChildren {
  container: CanvasRenderer;
  node: YogaNode;
  bounds = defaultBounds;
  props: Props;

  constructor(props: Props, container: CanvasRenderer) {
    super();
    this.container = container;

    this.node = Node.create();
    this.props = props;

    this.layout();
  }

  update(props: Props) {
    this.props = props;
    this.layout();
  }

  layout() {
    // Width
    if (this.props.width != null) {
      this.node.setWidth(this.props.width);
    }
    if (this.props.maxWidth != null) {
      this.node.setMaxWidth(this.props.maxWidth);
    }
    if (this.props.minWidth != null) {
      this.node.setMinWidth(this.props.minWidth);
    }

    // Height
    if (this.props.height != null) {
      this.node.setHeight(this.props.height);
    }
    if (this.props.maxHeight != null) {
      this.node.setMaxHeight(this.props.maxHeight);
    }
    if (this.props.minHeight != null) {
      this.node.setMinHeight(this.props.minHeight);
    }

    // Flex
    if (this.props.flex != null) {
      this.node.setFlex(this.props.flex);
    }
    if (this.props.flexBasis != null) {
      this.node.setFlexBasis(this.props.flexBasis);
    }
    if (this.props.flexDirection != null) {
      this.node.setFlexDirection(flexDirectionToYoga[this.props.flexDirection]);
    }
    if (this.props.flexGrow != null) {
      this.node.setFlexGrow(this.props.flexGrow);
    }
    if (this.props.flexShrink != null) {
      this.node.setFlexShrink(this.props.flexShrink);
    }
    if (this.props.flexWrap != null) {
      this.node.setFlexWrap(flexWrapToYoga[this.props.flexWrap]);
    }

    // Aspect Ratio
    if (this.props.aspectRatio != null) {
      this.node.setAspectRatio(this.props.aspectRatio);
    }

    // Overflow
    if (this.props.overflow != null) {
      this.node.setOverflow(overflowToYoga[this.props.overflow]);
    }

    // Position
    if (this.props.position != null) {
      this.node.setPositionType(positionToYoga[this.props.position]);
    }
    if (this.props.left != null) {
      this.node.setPosition(EDGE_LEFT, this.props.left);
    }
    if (this.props.top != null) {
      this.node.setPosition(EDGE_TOP, this.props.top);
    }
    if (this.props.right != null) {
      this.node.setPosition(EDGE_RIGHT, this.props.right);
    }
    if (this.props.bottom != null) {
      this.node.setPosition(EDGE_BOTTOM, this.props.bottom);
    }

    // Justify & Align
    if (this.props.justifyContent != null) {
      this.node.setJustifyContent(
        justifyContentToYoga[this.props.justifyContent]
      );
    }
    if (this.props.alignItems != null) {
      this.node.setAlignItems(alignItemsToYoga[this.props.alignItems]);
    }
    if (this.props.alignSelf != null) {
      this.node.setAlignSelf(alignSelfToYoga[this.props.alignSelf]);
    }
    if (this.props.alignContent != null) {
      this.node.setAlignContent(alignContentToYoga[this.props.alignContent]);
    }

    // Padding
    if (this.props.padding != null) {
      this.node.setPadding(EDGE_ALL, this.props.padding);
    }
    if (this.props.paddingBottom != null) {
      this.node.setPadding(EDGE_BOTTOM, this.props.paddingBottom);
    }
    if (this.props.paddingHorizontal != null) {
      this.node.setPadding(EDGE_HORIZONTAL, this.props.paddingHorizontal);
    }
    if (this.props.paddingLeft != null) {
      this.node.setPadding(EDGE_LEFT, this.props.paddingLeft);
    }
    if (this.props.paddingRight != null) {
      this.node.setPadding(EDGE_RIGHT, this.props.paddingRight);
    }
    if (this.props.paddingTop != null) {
      this.node.setPadding(EDGE_TOP, this.props.paddingTop);
    }
    if (this.props.paddingVertical != null) {
      this.node.setPadding(EDGE_VERTICAL, this.props.paddingVertical);
    }

    // Margin
    this.setMargin(EDGE_ALL, this.props.margin);
    this.setMargin(EDGE_BOTTOM, this.props.marginBottom);
    this.setMargin(EDGE_HORIZONTAL, this.props.marginHorizontal);
    this.setMargin(EDGE_LEFT, this.props.marginLeft);
    this.setMargin(EDGE_RIGHT, this.props.marginRight);
    this.setMargin(EDGE_TOP, this.props.marginTop);
    this.setMargin(EDGE_VERTICAL, this.props.marginVertical);
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

  recomputeLayoutIfDirty() {
    if (!this.node.isDirty()) return;

    this.node.calculateLayout(void 0, void 0, DIRECTION_LTR);

    const childMatrix = this.props.transformMatrix || identityMatrix;
    const left = childMatrix[4];
    const top = childMatrix[5];
    const childWidth = this.node.getComputedWidth();
    const childHeight = this.node.getComputedHeight();
    const right =
      childMatrix[0] * childWidth +
      childMatrix[2] * childHeight +
      childMatrix[4];
    const bottom =
      childMatrix[1] * childWidth +
      childMatrix[3] * childHeight +
      childMatrix[5];
    this.bounds = {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }

  render(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    ctx.save();

    if (this.props.transformMatrix) {
      ctx.transform(...this.props.transformMatrix);
    }

    if (this.props.opacity != null) {
      ctx.globalAlpha = this.props.opacity;
    }

    const borderTopLeftRadius =
      this.props.borderTopLeftRadius || this.props.borderRadius;
    const borderTopRightRadius =
      this.props.borderTopRightRadius || this.props.borderRadius;
    const borderBottomLeftRadius =
      this.props.borderBottomLeftRadius || this.props.borderRadius;
    const borderBottomRightRadius =
      this.props.borderBottomRightRadius || this.props.borderRadius;

    const top = this.node.getComputedTop();
    const left = this.node.getComputedLeft();
    const right = left + this.node.getComputedWidth();
    const bottom = top + this.node.getComputedHeight();

    if (this.props.backgroundColor || this.props.borderColor) {
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
      if (this.props.backgroundColor) {
        ctx.fillStyle = this.props.backgroundColor;
        ctx.fill();
      }
      if (this.props.borderColor) {
        ctx.lineWidth = this.props.borderWidth || 1;
        ctx.strokeStyle = this.props.borderColor;
        ctx.stroke();
      }
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

  renderContent(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {}

  addChild(child: View) {
    super.addChild(child);
    this.node.insertChild(child.node, this.children.length - 1);
  }

  insertChildBefore(child: View, beforeChild: View) {
    const index = super.insertChildBefore(child, beforeChild);
    this.node.insertChild(child.node, index);
    return index;
  }

  removeChild(child: View) {
    super.removeChild(child);
    this.node.removeChild(child.node);
  }

  destroy() {
    // noop
  }
}

export type TextProps = TextStyleProps &
  RCF.Handlers & {
    text: string;
  };

export class Text extends View<TextProps> {
  wrappedText: ReturnType<TextBreaker["breakText"]> | null = null;
  fontSize: number = 16;
  lineHeight: number = 16;
  fontStyle: string = "16px sans-serif";

  constructor(props: TextProps, container: CanvasRenderer) {
    super(props, container);
    this.computeProperties();
    this.node.setMeasureFunc(
      (width, widthMeasureMode, height, heightMeasureMode) => {
        if (!container.textBreaker) return { width: 0, height: 0 };

        this.wrappedText = container.textBreaker.breakText(
          this.props.text,
          width,
          this.fontStyle
        );
        const maxTextWidth = Math.max(...this.wrappedText.map((t) => t.width));
        return {
          width: maxTextWidth || 0,
          height: this.wrappedText.length * this.lineHeight,
        };
      }
    );
  }

  computeProperties() {
    this.fontSize = this.props.fontSize || 16;
    this.lineHeight = this.props.lineHeight || this.fontSize;
    this.fontStyle = `${this.fontSize}px ${
      this.props.fontFamily || "sans-serif"
    }`;
  }

  update(props: TextProps) {
    const prevProps = this.props;
    super.update(props);
    this.computeProperties();
    if (
      prevProps.text !== this.props.text ||
      prevProps.fontSize !== this.props.fontSize ||
      prevProps.lineHeight !== this.props.lineHeight ||
      prevProps.fontFamily !== this.props.fontFamily
    ) {
      this.node.markDirty();
    }
  }

  private renderText = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    text: string,
    left: number,
    top: number,
    width: number
  ) => {
    ctx.fillText(text, left, top);
  };

  private renderPlaceholder = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    text: string,
    left: number,
    top: number,
    width: number
  ) => {
    ctx.fillRect(left, top, width, this.lineHeight * 0.8);
  };

  renderContent(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    let renderText = this.renderText;
    let textAlign = this.props.textAlign;

    const { a: scaleX, d: scaleY } = ctx.getTransform();
    if (Math.min(scaleX, scaleY) * this.fontSize <= 4) {
      ctx.fillStyle = this.props.color ?? "black";
      ctx.globalAlpha = 0.5;
      renderText = this.renderPlaceholder;
      if (textAlign === "justify") {
        textAlign = "left";
      }
    } else {
      ctx.textBaseline = "top";
      ctx.fillStyle = this.props.color ?? "black";
      ctx.font = this.fontStyle;
    }

    this.wrappedText?.forEach(({ text, width }, index) => {
      let left =
        this.node.getComputedLeft() + this.node.getComputedPadding(EDGE_LEFT);
      const top =
        this.node.getComputedTop() +
        this.node.getComputedPadding(EDGE_TOP) +
        this.lineHeight * index;

      switch (textAlign) {
        case "center":
          left +=
            (this.node.getComputedWidth() -
              this.node.getComputedPadding(EDGE_LEFT) -
              this.node.getComputedPadding(EDGE_RIGHT) -
              width) /
            2;
          renderText(ctx, text, left, top, width);
          break;
        case "right":
          left +=
            this.node.getComputedWidth() -
            this.node.getComputedPadding(EDGE_LEFT) -
            this.node.getComputedPadding(EDGE_RIGHT) -
            width;
          renderText(ctx, text, left, top, width);
          break;
        case "justify": {
          let availableWidth =
            this.node.getComputedWidth() -
            this.node.getComputedPadding(EDGE_LEFT) -
            this.node.getComputedPadding(EDGE_RIGHT) -
            width;
          if (!availableWidth) {
            renderText(ctx, text, left, top, width);
            break;
          }

          const space = "\u0020";
          const words = text.split(space);
          if (words.length <= 1) {
            renderText(ctx, text, left, top, width);
            break;
          }

          const spaceLength =
            this.container.textBreaker?.measureText(space, this.fontStyle) ?? 0;
          availableWidth += (words.length - 1) * spaceLength;

          const spacingBetweenEachWord = availableWidth / (words.length - 1);
          words.forEach((word, index) => {
            if (index) {
              left += spacingBetweenEachWord;
            }
            renderText(ctx, word, left, top, width);
            left +=
              this.container.textBreaker?.measureText(word, this.fontStyle) ??
              0;
          });
          break;
        }
        case "auto":
        case "left":
        default:
          renderText(ctx, text, left, top, width);
          break;
      }
    });
  }
}

export type ImageProps = ImageStyleProps &
  RCF.Handlers & {
    image: HTMLImageElement;
  };

export class Image extends View<ImageProps> {
  renderContent(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    const cw = this.node.getComputedWidth();
    const ch = this.node.getComputedHeight();
    const ratioContainer = cw / ch;
    const iw = this.props.image.width;
    const ih = this.props.image.height;
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
      this.props.image,
      this.node.getComputedLeft() + (cw - dw) / 2,
      this.node.getComputedTop() + (ch - dh) / 2,
      dw,
      dh
    );
  }
}
