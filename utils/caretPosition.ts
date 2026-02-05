
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Properties to mirror from the textarea/input to the hidden div
const properties = [
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
];

let mirrorDiv: HTMLDivElement | null = null;

function createMirrorDiv() {
    if (mirrorDiv) return;
    mirrorDiv = document.createElement('div');
    document.body.appendChild(mirrorDiv);
}

export function getCaretCoordinates(element: HTMLTextAreaElement | HTMLInputElement, position: number) {
    createMirrorDiv();

    if (!mirrorDiv) {
        return null;
    }
    
    const style = window.getComputedStyle(element);
    
    // Default styling to make the div invisible and non-interactive
    mirrorDiv.style.whiteSpace = 'pre-wrap';
    mirrorDiv.style.wordWrap = 'break-word';
    mirrorDiv.style.position = 'absolute';
    mirrorDiv.style.top = `${element.offsetTop}px`;
    mirrorDiv.style.left = '-9999px'; // Position off-screen
    mirrorDiv.style.visibility = 'hidden';

    // Copy essential styles from the textarea to the mirror div
    properties.forEach(prop => {
        mirrorDiv.style[prop as any] = style[prop as any];
    });

    // Use textContent to preserve newlines
    mirrorDiv.textContent = element.value.substring(0, position);

    // Create a span to measure the caret position and append it
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.'; // Use a non-breaking space or a dot if at the end
    mirrorDiv.appendChild(span);

    const { offsetLeft: spanX, offsetTop: spanY, offsetHeight: spanHeight } = span;
    const { offsetLeft: mirrorX, offsetTop: mirrorY } = mirrorDiv;

    // Get the position of the textarea itself relative to the document
    const { x: elementX, y: elementY } = element.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;

    return {
        top: elementY + scrollTop + spanY - element.scrollTop,
        left: elementX + scrollLeft + spanX - element.scrollLeft,
        height: spanHeight,
    };
}
