import Controller from "../controller";
import View from "../view";
import fns from "../units/fns";
import { buttonStates, buttonStates as states } from '@/scripts/units/enums'

export default class Button {

    /**
     * 
     * @param { View } view 
     * @param {object} param2 
     * @param {string} [param2.state]
     * @param {boolean} [param2.is3d]
     * @param {string|boolean} [param2.switchTag] Etiqueta para settar `switchFeat.pushed` de todos relacionados a false
     */
    constructor(view, { x, y, width, height }, { state, is3d, switchTag } = {}) {

        view.embeddables.push(this);

        this.view = view;

        // No click, move 1 pixel para a sudeste
        this.is3d = is3d ?? true;
        this.switchFeat = switchTag ? { tag: switchTag, pushed: false } : false;
        this.background = null;

        this.context = view.context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.handlers = {
            click: null
        };

        this.images = {
            normal: null,
            hover: null,
            disabled: null,
            pushed: null,
            hoverPushed: null
        };

        this.state = state ?? states.normal;
        this.isPressed = false;
    }

    set setState(value) {

        this.state = value;

        if (this.isHidden) this.drawBackground();
        else this.draw();
    }

    /**
     * @param {{x:number,y:number,width:number,height:number}}
     */
    set setRect({ x, y, width, height }) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get isHidden() {

        return this.state === states.hidden;
    }

    toogleVisibility() {

        this.state = this.isHidden ? states.normal : states.hidden;

        this.draw();
    }

    bind(handlers) {

        this.handlers = { ...handlers };
    }

    clearHover() {

        if (this.state !== states.hover) return;

        this.setState = states.normal;
    }

    mousedown() {

        const { state } = this;

        if (state === states.disabled || state === states.hidden) return;

        this.isPressed = true;

        if (this.is3d === false) return;

        this.draw();
    }

    click() {

        // Evitar mousedown fora do button e mouseup no button
        if (!this.isPressed) return;

        this.isPressed = false;

        if (this.switchFeat) this.switchFeat.pushed = true;

        // NOTE:: Ou `bind` no controller, `click: xxx.bind(null, button)`
        this.handlers.click(this);
        this.draw();
    }

    hover() {

        if (this.state !== states.normal) return;

        this.state = states.hover;

        this.draw();

        const inter = setInterval(() => {

            const mousePoint = Controller.mousePoint;

            if (!this.hitMe(mousePoint)) {

                // NOTE:: Pode acontecer settar a `disabled` e estar `hover`
                const isEnabled = this.state !== states.disabled && this.state !== states.hidden;
                if (isEnabled) this.state = states.normal;
                this.isPressed = false;
                this.draw();

                clearInterval(inter);
            }

        }, 30);
    }

    hitMe({ x, y }) {

        if (this.state === buttonStates.hidden) return false;

        const right = this.x + this.width;
        const bottom = this.y + this.height;

        const horizontal = x >= this.x && x <= right;
        const vertical = y >= this.y && y <= bottom;

        return horizontal && vertical;
    }

    async setImages(image, { row }) {

        const keys = ['normal', 'hover', 'disabled', 'pushed', 'hoverPushed'];

        const { x, y, width, height } = this;

        this.background = this.view.context.getImageData(x, y, width + 1, height + 1);

        const images = await fns.sprites(image, row, width, height)

        images.forEach((v, i) => {

            const key = keys[i];

            this.images[key] = v;
        });
    }

    getImageName(state) {

        if (!this.switchFeat || !this.switchFeat.pushed) return state;

        return state === states.hover ? 'hoverPushed' : 'pushed';
    }

    draw() {

        const { state } = this;

        if (state === states.hidden) return;

        this.context.setTransform(1, 0, 0, 1, 0, 0);

        if (this.is3d) {

            this.context.putImageData(this.background, this.x, this.y);
        }

        const x = this.x + (this.isPressed ? 1 : 0);
        const y = this.y + (this.isPressed ? 1 : 0);

        const imageName = this.getImageName(state);

        this.context.drawImage(this.images[imageName], x, y, this.width, this.height);
    }

    drawBackground() {

        if (!this.background) return;

        this.context.putImageData(this.background, this.x, this.y);
    }

    set visibility(value) {

        this.state = value ? states.normal : states.hidden;

        if (value) this.draw();
        else this.drawBackground();
    }

    // NOTE:: Sem uso
    get visibility() {
        
        return undefined;
    }
}