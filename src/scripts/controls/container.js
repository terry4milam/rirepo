import View from '@/scripts/view';
import Control from './control';

export default class Container extends Control {

    /**
     * 
     * @param { View } view 
     * @param {*} rect 
     * @param {object} options
     * @param {boolean} [options.visible=true] Para testar o hover primeiro (hitMe)
     */
    constructor(view, rect, { visible } = {}) {

        super(view, rect);

        this.childs = [];

        this.image = null;

        this.background = null;
        this.visible = visible ?? true;
    }

    async setImage(image) {

        const { x, y, width, height } = this;

        this.background = this.view.context.getImageData(x, y, width + 1, height + 1);

        this.image = image;
    }

    addChild(child) {

        this.childs.push(child);

        child.visibility = this.visible;
    }

    // #region Mandory Methods
    /**
     * @override
     */
    click() { }

    /**
     * @override
     */
    mousedown() { }

    /**
     * @override
     */
    hover() { }

    /**
     * @override
     * @param {{x:number, y:number}} point 
     */
    hitMe({ x, y }) {

    }

    /**
     * @override
     */
    draw() {

        if (!this.visible) return;

        this.context.setTransform(1, 0, 0, 1, 0, 0);

        this.context.drawImage(this.image, this.x, this.y);

        this.childs.forEach(v => v.draw());
    }

    // #endregion

    drawBackground() {

        if (!this.background) return;

        this.context.putImageData(this.background, this.x, this.y);
    }

    set visibility(value) {

        this.visible = value;

        this.childs.forEach(v => v.visibility = value);

        if (value) this.draw();
        else this.drawBackground();
    }

    get visibility() {

        return this.visible;
    }

}