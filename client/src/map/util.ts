type FontStyle = {
    fontStyle?: string;
    fontSize?: number;
    fontFamily?: string;
};
function canvasFont(font: FontStyle) {
    const { fontStyle = 'normal', fontSize = 10, fontFamily = 'Arial' } = font;
    return `${fontStyle} ${fontSize}px ${fontFamily}`;
}
export function textWidth(text, font: FontStyle) {
    const canvas = textWidth.canvas;
    const context = canvas.getContext("2d");
    context.font = canvasFont(font);
    return context.measureText(text).width;
}
// re-use canvas object for better performance
textWidth.canvas = document.createElement("canvas");
