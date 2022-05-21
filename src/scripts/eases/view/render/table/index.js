import fns, { head, pureValue, thousandSeparator, twoDecimalOrWhole } from '@/scripts/units/fns';
import { HistoryT } from '@/scripts/units/history';
import { PlayerT } from '@/scripts/units/player';
import View from '@/scripts/view';
import displayPositions from '@/scripts/units/display-positions';
import biz from '@/scripts/units/biz';
import easeMiddlePot from './middle-pot';
import easeStaticAssets from './static';
import easeRender from '@/scripts/eases/view/render/index'
import { pipe } from '@/scripts/units/fxnl';
import enums from '@/scripts/units/enums';

export const displayValue = displayValueAssets => (value, { showZero } = {}) => {

    if (pureValue(value) === 0 && !showZero) return 'ALL IN';

    const { cashSign, isBigBlinds, bigBlind } = displayValueAssets;

    const finalBBs = pipe(pureValue, thousandSeparator)(value / bigBlind);

    if (isBigBlinds) return `${finalBBs} BB`;

    const finalAmount = pipe(twoDecimalOrWhole, thousandSeparator)(value);

    if (cashSign) return `${cashSign} ${finalAmount}`;

    return finalAmount;
};

/**
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {string} text 
 * @param {{x:number,y:number}} point 
 */
const drawTextCenter = function (context, text, color, point) {

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = color;

    context.fillText(text, point.x, point.y);
};

/**
 * @this {View}
 * @param {object} obj 
 * @param {boolean} obj.isPLO
 * @param {{x:number,y:number}} obj.point
 * @param {number} [obj.alpha=1]
 * @param {number} [obj.cardsCount=2]
 */
export const drawPlayerCards = function ({ isPLO, point, alpha, cardsCount, player }) {

    const offSetX = 15;
    const offSetY = 4;

    const offSetX_PLO_5_6 = -(cardsCount - 4) * 6;

    const outSetX = isPLO ? -offSetX + offSetX_PLO_5_6 : 0;
    const outSetY = isPLO ? -offSetY : 0;

    return (card, index) => {

        const { suit, value } = biz.getCardIndex(card);

        const image = this.images.deck[suit][value];

        const x = point.x + offSetX * index + outSetX;

        const y = point.y + offSetY * index + outSetY;

        this.context.drawImage(image, x, y);

        if (player.inPlay) return;

        this.context.fillStyle = 'gray';
        this.context.globalAlpha = 0.5;
        this.context.fillRect(x, y, 50, 70);
        this.context.globalAlpha = 1;
    };
};


/**
 * @this {View}
 * @param {number} value 
 */
const pot = function (value, displayValueAbsx) {

    const amount = displayValueAbsx(value);
    const text = `Pot: ${amount}`;

    this.context.font = '14px Arial';
    const textWidth = this.context.measureText(text).width;

    const { table: tableRect } = easeRender.rects;

    const center = tableRect.width / 2;
    const verticalPadding = 16;
    const boxWidth = textWidth + verticalPadding;
    const x = center - textWidth / 2 - verticalPadding / 2;

    this.context.fillStyle = 'black';
    this.context.fillRect(x - 1, 7, boxWidth + 2, 21);
    this.context.fillStyle = '#ffffe1';
    this.context.fillRect(x, 8, boxWidth, 19);

    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = 'black';

    this.context.fillText(text, center, 18);
};

/**
 * @this {View}
 * @param {HistoryT} history 
 * @param {number} tableMax
 */
const players = function (history, tableMax, displayValueAbsx) {

    const { players } = history

    const drawImage = (image, point, alpha = 1) => {

        this.context.globalAlpha = alpha;
        this.context.drawImage(image, point.x, point.y);
        this.context.globalAlpha = 1;
    };

    const drawPlayersProfit = (player, displayPosition) => {

        if (!this.showPlayersProfit.checked) return;

        const red = '#660000';
        const green = '#006600';
        const color = player.profit === 0 ? 'LightGrey' :
            player.profit > 0 ? green : red;

        const profit = displayValueAbsx(player.profit, { showZero: true });
        const textWidth = this.context.measureText(profit).width + 8;

        const xProfit = displayPosition.profit.x + 1;
        const yProfit = displayPosition.profit.y + 1;

        this.context.save();
        this.context.translate(xProfit - 50, yProfit - 10);

        const gradient = this.context.createRadialGradient(50, 8, textWidth / 2, 50, 8, textWidth / 2 + 5);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'transparent');

        this.context.fillStyle = gradient;
        this.context.globalAlpha = 0.25;
        this.context.beginPath();
        this.context.ellipse(50, 8, 40, 6, 0, 0, 2 * Math.PI);
        this.context.fill();
        this.context.globalAlpha = 1;

        this.context.restore();

        drawTextCenter(this.context, profit, color, displayPosition.profit);
    };

    const isPLO = players.find(x => x.isHero).holeCards.length > 3;
    const cardsCount = players.find(x => x.isHero).holeCards.length;

    players.forEach(player => {

        const displayPosition = displayPositions(tableMax).find(x => player.seat === x.seatAjusted);

        const { emptySeat, status, dealer, inPlay } = this.images;

        const alpha = player.inPlay ? 1 : .4;
        drawImage(emptySeat, displayPosition.emptySeat, alpha);
        drawImage(status, displayPosition.status);

        drawTextCenter(this.context, player.name, 'white', displayPosition.name);

        // NOTE:: `mergedStack()` para haver varios estagios da stack no collect
        const stack = history.phase === enums.phase.summary
            ? displayValueAbsx(player.stack)
            : displayValueAbsx(player.mergedStack());

        drawTextCenter(this.context, stack, 'white', displayPosition.stack);

        if (player.isButton) {

            drawImage(dealer, displayPosition.dealer);
        }

        if (player.inPlay && !player.holeCards) {

            drawImage(inPlay, displayPosition.inPlay);

            if (isPLO) {

                const x = displayPosition.inPlay.x + 10;
                const y = displayPosition.inPlay.y + 4;
                drawImage(inPlay, { x, y });
            }
        }

        // NOTE:: na v0.11.1 mostra as cartas foldadas com "alpha", mesmo em "hero prespective"
        // if (player.holeCards && player.inPlay && !player.heroMucked) {
        if (player.holeCards && !player.heroMucked) {

            const point = displayPosition.holeCards;

            const drawPlayerCardsAbsx = drawPlayerCards.call(this, { isPLO, point, cardsCount, player });

            player.holeCards.forEach(drawPlayerCardsAbsx);
        }

        if (player.bounty) {

            const { x, y } = displayPosition.bounty;

            this.context.globalAlpha = alpha;

            const bountyWidth = this.context.measureText(player.bounty).width;

            this.context.beginPath();
            this.context.arc(x - bountyWidth / 2, y, 7, Math.PI / 2, Math.PI * 1.5);
            this.context.arc(x + bountyWidth / 2, y, 7, Math.PI * 1.5, Math.PI / 2);
            this.context.closePath();
            this.context.fillStyle = '#ffffe1';
            this.context.fill();
            this.context.fillStyle = 'black';
            this.context.stroke();

            drawTextCenter(this.context, player.bounty, 'blue', { x, y });
            this.context.globalAlpha = 1;
        }

        drawPlayersProfit(player, displayPosition);

    });
}

/**
 * @this {View}
 * @param {HistoryT} history 
 * @param {number} tableMax 
 */
const action = function (history, tableMax) {

    if (!history.action) return;

    const { player } = history;

    const findPlayer = x => player.seat === x.seatAjusted;

    const displayPosition = displayPositions(tableMax).find(findPlayer);

    const { actions } = this.images;

    const index = biz.getActionIndex(history.action);

    const { x, y } = displayPosition.action;

    this.context.drawImage(actions[index], x, y);
};

/**
 * @this {View}
 * @param {number} value 
 * @param {number} tableMax
 */
const waitingToAct = function (history, tableMax, displayValueAbsx) {

    if (!history.nextPlayer) return;

    const findPlayer = x => history.nextPlayer.seat === x.seatAjusted;

    const displayPosition = displayPositions(tableMax).find(findPlayer);

    const { statusHighlight: statusHighlightBare } = this.images;

    const { x, y } = displayPosition.statusHighlight;

    const { width, height } = statusHighlightBare;

    const { table: tableRect } = easeRender.rects;

    // NOTE:: Os metodos translate() e setTransform() não afectam
    // getImageData e putImageData
    const xReal = tableRect.x + x;
    const yReal = tableRect.y + y;

    const statusNormal = this.context.getImageData(xReal, yReal, width, height);

    let count = 0;

    const drawHighlight = () => {

        this.context.drawImage(statusHighlightBare, x, y);

        const { name, stack } = history.nextPlayer;

        drawTextCenter(this.context, name, 'black', displayPosition.name);
        drawTextCenter(this.context, displayValueAbsx(stack), 'black', displayPosition.stack);

        return this.context.getImageData(xReal, yReal, width, height);
    };

    const drawStatus = () => {

        const isHighlight = count % 2 === 1;

        const statusImage = isHighlight ? statusHighlight : statusNormal;

        this.context.putImageData(statusImage, xReal, yReal);

        count++;
    };

    const statusHighlight = drawHighlight();

    this.inter = setInterval(drawStatus, 500);
};

/**
 * @this {View}
 * @param {PlayerT[]} players 
 * @param {number} tableMax
 */
const betChips = function (players, tableMax) {

    const { chips } = this.images;

    players.forEach(player => {

        if (!player.amountOnStreet) return;

        const findPlayer = x => player.seat === x.seatAjusted;

        const displayPosition = displayPositions(tableMax).find(findPlayer);

        let { x, y } = displayPosition.betChips;

        const value = player.amountOnStreet;

        const chipsIndexs = biz.getChips(value)
            .map(x => biz.getChipIndex(x));

        chipsIndexs.forEach(chipIndex => {

            const chip = chips[chipIndex];

            this.context.drawImage(chip, x, y);

            y -= 4;
        });
    });
};

/**
 * @this {View}
 * @param {PlayerT[]} players 
 * @param {number} tableMax
 * @param {string[]} streetCards
 */
const chipsValues = function (players, tableMax, streetCards, displayValueAbsx) {

    const hasRiver = streetCards?.length === 5;
    const hasFlop = streetCards?.length >= 3;

    players.forEach(player => {

        if (!player.amountOnStreet) return;

        const findPlayer = x => player.seat === x.seatAjusted;

        const displayPosition = displayPositions(tableMax).find(findPlayer);

        const { x, y } = displayPosition.chipsValue;

        const { seatFixed } = displayPosition;

        const value = player.amountOnStreet;

        const text = displayValueAbsx(value);

        const textAlign = seatFixed >= 5 ? 'left' : 'right';

        const seat8fulfill = hasFlop && seatFixed === 8;
        const seat2fulfill = hasRiver && seatFixed === 2;

        if ((seat2fulfill || seat8fulfill) && text.length > 6) {

            this.context.fillStyle = 'black';
            const textWidth = this.context.measureText(text).width;
            // NOTE:: valor negativo no "witdh" faz o fillRect para tras
            const sign = textAlign === 'left' ? 1 : -1;
            this.context.fillRect(x, y - 12, textWidth * sign, 12);
        }

        this.context.textAlign = textAlign;
        this.context.textBaseline = 'bottom';
        this.context.fillStyle = 'white';

        this.context.fillText(text, x, y);
    });
};

/**
 * @this {View}
 * @param {string[]} streetCards 
 */
const streetCards = function (streetCards) {

    if (!streetCards) return;

    const { deck } = this.images;

    streetCards.forEach((card, index) => {

        const { suit, value } = biz.getCardIndex(card);

        const image = deck[suit][value];

        const x = 268 + image.width * index + (index * 4);

        const y = 152;

        this.context.drawImage(image, x, y);
    });
};

/**
 * @this {View}
 * @param {string[][]} streetCardsRIT
 * @param {string[]} streetCards
 */
const streetCardsRIT = function (streetCardsRIT, streetCards) {

    if (!streetCardsRIT || !streetCardsRIT.length) return;

    /**
     * 
     * @param {string[]} cards 
     * @param {number} countRIT 
     * @param {number} startRIT 0, 1 ou 2 - 0:Flop+, 1:Turn+, 2:River
     */
    const drawRit = (cards, countRIT, startRIT) => {

        cards.forEach((card, index) => {

            const { suit, value } = biz.getCardIndex(card);

            const image = smallDeck[suit][value];

            const xStartRIT = 268 + xStreet[startRIT];

            const x = xStartRIT + image.width * index + (index * 4);

            const y = 128 - countRIT * (image.height + 2);

            this.context.drawImage(image, x, y);
        });
    };

    const { smallDeck } = this.images;
    const [[{ width: cardWidth }]] = this.images.deck;
    const xStreet = [0, (cardWidth + 4) * 3, (cardWidth + 4) * 4];

    streetCardsRIT.forEach((cards, index) => {

        if (cards.toString() === streetCards.toString()) return;

        const uniques = cards.filter(v => !streetCards.includes(v));

        const startRIT = [5, 2, 1].indexOf(uniques.length);

        drawRit(uniques, index, startRIT);
    });
};


/**
 * @this {View}
 * @param {HistoryT} history 
 */
const middlePotValue = function (history, displayValueAbsx) {

    if (history.phase === enums.phase.summary) return;

    const streetAmount = history.players.reduce((acc, cur) => acc + cur.amountOnStreet, 0);

    const value = pureValue(history.pot - streetAmount);

    if (value === 0) return;

    const point = { x: 400, y: 272 };

    const text = displayValueAbsx(value);

    drawTextCenter(this.context, text, 'white', point);
};

export default {

    /**
     * 
     * @this {View}
     * @param {HistoryT} history 
     * @param {number} tableMax 
     * @param {object} displayValueAssets
     */
    render(history, tableMax, displayValueAssets) {

        // NOTE:: `inter` usado em `waitingToAct` e `middlePot`
        // Preciso do translate nos asyncs
        clearInterval(this.inter);

        easeStaticAssets.call(this);

        if (!history) return;

        const displayValueAbsx = displayValue(displayValueAssets);

        pot.call(this, history.pot, displayValueAbsx);

        this.context.font = '11px Arial';

        players.call(this, history, tableMax, displayValueAbsx);

        waitingToAct.call(this, history, tableMax, displayValueAbsx);

        streetCards.call(this, history.streetCards);

        streetCardsRIT.call(this, history.streetCardsRIT, history.streetCards);

        chipsValues.call(this, history.players, tableMax, history.streetCards, displayValueAbsx);

        easeMiddlePot.call(this, history, tableMax, displayValueAbsx);

        betChips.call(this, history.players, tableMax);

        action.call(this, history, tableMax);

        middlePotValue.call(this, history, displayValueAbsx);
    }
}

export const testables = {

    middlePotValue,
    streetCards
};