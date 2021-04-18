import _ from "lodash";

import { createOffscreenCanvas } from "../createOffscreenCanvas";

import {
  findNextGraphemeBreak,
  findPreviousGraphemeBreak,
} from "./grapheme-break";
import { UnicodeTrie, LineBreaker } from "./line-break";

const SPACE = "\u0020";
const ELLIPSIS = "\u2026";
const LINE_BREAK_REGEX = /^(\r|\n|\r\n)$/;
const MULTIPLE_SPACE_REGEX = new RegExp(`${SPACE}(${SPACE})+`, "g");

export class TextBreaker {
  private lineBreakTrie: UnicodeTrie;

  private getMeasurementContext = _.memoize((fontStyle: string) => {
    const canvas = createOffscreenCanvas(100, 100);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Could not instantiate a canvas");
    }
    ctx.font = fontStyle;
    return _.memoize((string: string) => ctx.measureText(string).width);
  });

  constructor(lineBreakClassesBuffer: Uint8Array) {
    this.lineBreakTrie = new UnicodeTrie(lineBreakClassesBuffer);
  }

  measureText(text: string, fontStyle: string) {
    const measureText = this.getMeasurementContext(fontStyle);
    return measureText(text);
  }

  breakText(
    text: string,
    maxWidth: number,
    fontStyle: string,
    maxLines?: number
  ) {
    // Trim and replace multiple spaces with single one
    text = (text || "").trim().replace(MULTIPLE_SPACE_REGEX, SPACE);

    if (!text) return [];

    const measureText = this.getMeasurementContext(fontStyle);
    const spaceLength = measureText(SPACE);

    const lineBreaker = new LineBreaker(this.lineBreakTrie, text);
    const splitText: {
      width: number;
      text: string;
      ellipsisDelta?: number;
    }[] = [];

    let currentLineWidth = 0;
    let lineStartIndex = 0;
    let lineEndIndex = 0;

    const getWidthWithoutLastSpace = (charIndex: number, width: number) =>
      text.charAt(charIndex) === SPACE ? width - spaceLength : width;

    const addCurrentLine = () => {
      if (lineEndIndex > lineStartIndex) {
        splitText.push({
          width: getWidthWithoutLastSpace(lineEndIndex - 1, currentLineWidth),
          text: text.slice(lineStartIndex, lineEndIndex).trim(),
        });
      }
      if (maxLines && splitText.length === maxLines) {
        if (lineEndIndex < text.length) {
          const ellipsisLength = measureText(ELLIPSIS);
          const lastLine = splitText[splitText.length - 1];
          if (lastLine.width + ellipsisLength <= maxWidth) {
            lastLine.ellipsisDelta = ellipsisLength;
            lastLine.text += ELLIPSIS;
          } else {
            // Remove grapheme(s) from the end to give space to ellipsis
            let index = lastLine.text.length;
            let widthAvailable = 0;
            while (index > 0 && widthAvailable < ellipsisLength) {
              const previousIndex = findPreviousGraphemeBreak(
                lastLine.text,
                index
              );
              const grapheme = text.slice(previousIndex, index);
              widthAvailable += measureText(grapheme);
              index = previousIndex;
            }
            lastLine.ellipsisDelta = widthAvailable - ellipsisLength;
            lastLine.text = lastLine.text.slice(0, index) + ELLIPSIS;
          }
        }
        return true;
      } else {
        return false;
      }
    };

    let nextBreak: ReturnType<typeof lineBreaker.nextBreak>;

    let breakStart = lineStartIndex;
    while ((nextBreak = lineBreaker.nextBreak())) {
      let breakWidth = 0;
      const breakEnd = nextBreak.position;
      let index = breakStart;
      while (index < breakEnd) {
        const nextIndex = Math.min(
          findNextGraphemeBreak(text, index),
          breakEnd
        );
        const grapheme = text.slice(index, nextIndex);
        const graphemeWidth = LINE_BREAK_REGEX.test(grapheme)
          ? 0
          : measureText(grapheme);

        if (breakWidth + (grapheme === SPACE ? 0 : graphemeWidth) > maxWidth) {
          // Word is too long, we have to break it

          // We add current line if any and reset its values
          if (addCurrentLine()) {
            return splitText;
          }

          // Then add a new line with current partial word
          lineStartIndex = breakStart;
          lineEndIndex = index;
          currentLineWidth = breakWidth;
          if (addCurrentLine()) {
            return splitText;
          }

          // Reset values
          lineStartIndex = index;
          lineEndIndex = index;
          currentLineWidth = 0;
          breakStart = index;
          breakWidth = 0;
        }

        breakWidth += graphemeWidth;
        index = nextIndex;
      }

      if (
        currentLineWidth + getWidthWithoutLastSpace(breakEnd - 1, breakWidth) >
        maxWidth
      ) {
        if (addCurrentLine()) {
          return splitText;
        }
        lineStartIndex = breakStart;
        lineEndIndex = breakEnd;
        currentLineWidth = breakWidth;
      } else {
        currentLineWidth += breakWidth;
        lineEndIndex = breakEnd;
      }

      if (nextBreak.required) {
        if (addCurrentLine()) {
          return splitText;
        }
        lineStartIndex = breakEnd;
        lineEndIndex = breakEnd;
        currentLineWidth = 0;
      }

      breakStart = breakEnd;
    }

    addCurrentLine();

    return splitText;
  }
}
