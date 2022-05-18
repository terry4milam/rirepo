import View from "./view";
import Model from "./model";
import enums from '@/scripts/units/enums';
import fns from '@/scripts/units/fns'
import Button from './controls/button';
import { HistoryT } from '@/scripts/units/history';

export default class Controller {

    static mousePoint = {};

    /**
     * 
     * @param {Model} model 
     * @param {View} view 
     */
    constructor(model, view) {

        // Para log e imagens
        this.isLoading = true;

        this.model = model;
        this.view = view;

        this.view.bindControls({
            windowKeydown: this.handlerWindow_onKeydown,
            loadHandHistory: this.handlerLoadHandHistory_onChange,
            canvasMouseDown: this.handlerCanvas_onMouseDown,
            canvasMouseUp: this.handlerCanvas_onMouseUp,
            canvasMouseMove: this.handlerCanvas_onMouseMove,
            canvasKeyUp: this.handlerCanvas_onKeyUp,
            canvasFullscreenchange: this.handlerCanvas_onFullscreenchange,
            fullscreen: this.handlerFullscreen_onClick,
            loadHHBogus: this.handlerOpenHH_onClick
        });

        this.view.bindEmbeddedControls({
            openHH: {
                click: this.handlerOpenHH_onClick
            },
            previousHand: {
                click: this.handlerPreviousHand_onClick,
            },
            previousAction: {
                click: this.handlerPreviousAction_onClick,
            },
            play: {
                click: this.handlerPlay_onClick,
            },
            nextAction: {
                click: this.handlerNextAction_onClick,
            },
            nextHand: {
                click: this.handlerNextHand_onClick,
            },
            handsList: {
                click: this.handlerHandsList_onClick,
                tracker: this.model.tracker
            },
            showBigBlinds: {
                click: this.handleShowBigBlinds_onClick
            },
            searchHand: {
                click: this.handleSearchHand_onClick
            },
            clearHandsFilter: {
                click: this.handleClearHandsFilter_onClick
            },
            shareHand: {
                click: this.handlerShareHand_onClick
            },
            fullWindowed: {
                click: this.handlerFullWindowed_onClick
            },
            preflopNav: {
                click: this.handlerPreflopNav_onClick
            },
            flopNav: {
                click: this.handlerFlopNav_onClick
            },
            turnNav: {
                click: this.handlerTurnNav_onClick
            },
            riverNav: {
                click: this.handlerRiverNav_onClick
            },
            summaryNav: {
                click: this.handlerSummaryNav_onClick
            },
            settings: {
                click: this.handlerSettings_onClick
            },
            startBySummary: {
                click: this.handlerStartBySummary_onClick
            },
            showPlayersProfit: {
                click: this.handlerShowPlayersProfit_onClick
            },
            closeSettings: {
                click: this.handlerCloseSettings_onClick
            }
        });

        const tryPreLoadLog = () => {

            const isFile = window.location.protocol === 'file:';

            if (isFile) this.model.tryLoadFromHardDrive(this)
            else this.model.tryLoadFromOnlineDB(this);

            this.view.addPostMessageListener(this, this.model);
        };

        this.view.updateSettings(this.model.loadLocalStorageSettings());

        this.view.setImages(tryPreLoadLog, this);
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    setMousePoint(e) {

        const {
            width: canvasWidth, height: canvasHeight,   // Medida real do canvas
            offsetWidth, offsetHeight                   // Medida escalar (settada no style)
        } = this.view.canvas;

        const windowed = () => {

            return {
                x: e.offsetX * canvasWidth / offsetWidth,
                y: e.offsetY * canvasHeight / offsetHeight
            };
        };

        const fullScreen = () => {

            const widthRatio = window.innerWidth / canvasWidth;
            const heightRatio = window.innerHeight / canvasHeight;

            // O Browser faz a escalagem com um aspecto ratio fixo, então se
            // o canvas não tiver o mesmo aspecto ratio do ecran, a imagem fica 
            // com "barras negras", o ratio escolhido é o menor, ou seja, da
            // dimensão que fica com a margem 0,  

            const ratio = Math.min(widthRatio, heightRatio);

            const zoomWidth = canvasWidth * ratio;
            const zoomHeight = canvasHeight * ratio;

            const marginHorizontal = (window.innerWidth - zoomWidth) / 2;
            const marginVertical = (window.innerHeight - zoomHeight) / 2;

            return {
                x: (e.offsetX - marginHorizontal) * canvasWidth / zoomWidth,
                y: (e.offsetY - marginVertical) * canvasHeight / zoomHeight
            };
        };

        const mousePoint = fns.isFullScreen() ? fullScreen() : windowed();

        Controller.mousePoint = mousePoint;
    }

    async handLoad(log, { fromDB, hero } = {}) {

        this.isLoading = true;

        this.view.resetScreen();

        log = this.model.fixLogEdges(log);

        if (!this.model.logValidation(log)) return this.isLoading = false;

        this.view.handsList.removeAll();

        const transpiledLog = this.model.transpileToPokerStars(log, fromDB, hero);

        await this.model.processLog(transpiledLog, this.view);

        this.view.handsList.setRange(this.model.handsList);

        this.view.handsList.setMaxHiddenRule();

        const history = this.model.navigationStreet(this.model.startPhase);

        const chat = this.model.makeChatArray(this.model.startPhase);
        this.view.updateChat({ chat });

        this.finalizeNavigation(history);

        this.view.resetHandSearchFilterVisibility();

        this.view.enableShareHand({ fromDB });

        this.isLoading = false;
    }

    handlerWindow_onKeydown = (e) => {

        const scrollKeys = ['ArrowUp', 'ArrowDown'];

        if (scrollKeys.includes(e.code)) {

            e.preventDefault();
        }
    }

    handlerOpenHH_onClick = () => {

        // NOTE:: Existem dois controlos:
        // * openHH - Embedded button, quando clicado (este evento) triga o "loadHH"
        // * loadHH - `<input type="file" hidden>` o evento change lê o file

        this.view.stopPlayback();

        this.view.loadHH.click();
    }

    handlerLoadHandHistory_onChange = (event) => {

        const { loadHH } = this.view;

        const reader = new FileReader();

        reader.onload = () => {

            this.handLoad(reader.result);
        };

        reader.onerror = () => {

            alert('Something went wrong');
        };

        if (loadHH.value.length) {

            const singleFile = loadHH.files.length === 1;

            if (singleFile) reader.readAsText(loadHH.files[0]);
            else alert('Please select only one file!');
        }
    }

    handlerCanvas_onMouseDown = (e) => {

        const mousePoint = Controller.mousePoint;

        const found = this.view.embeddables.find(v => v.hitMe(mousePoint));

        if (found) found.mousedown(mousePoint);
    }

    handlerCanvas_onMouseUp = (e) => {

        const mousePoint = Controller.mousePoint;

        const found = this.view.embeddables.find(v => v.hitMe(mousePoint));

        if (found) found.click(mousePoint);
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    handlerCanvas_onMouseMove = (e) => {

        if (this.isLoading) return;

        this.setMousePoint(e)

        const mousePoint = Controller.mousePoint;

        const found = this.view.embeddables.find(v => v.hitMe(mousePoint));

        if (found) found.hover(mousePoint);

        const { hero } = this.model;
        const { tableMax } = { ...this.model.mainInfo };

        if (this.view.hoverHero(hero, mousePoint, tableMax)) {

            this.view.showHeroFolderHoleCards(hero, this.model);
        }
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    handlerCanvas_onKeyUp = (e) => {

        const enables = this.model.getNavigationEnables();
        const streetEnables = this.model.streetEnables();

        const map = {

            ArrowUp: 'previousHand',
            ArrowLeft: 'previousAction',
            ArrowRight: 'nextAction',
            ArrowDown: 'nextHand',
            KeyP: `${enums.phase.preflop}`,
            KeyF: `${enums.phase.flop}`,
            KeyT: `${enums.phase.turn}`,
            KeyR: `${enums.phase.river}`,
            KeyS: `${enums.phase.summary}`,
        };

        const buttonLabel = map[e.code];

        if (enables[buttonLabel]) {

            const capitalised = fns.capitalize(buttonLabel);

            this[`handler${capitalised}_onClick`]();
        }

        if (streetEnables[buttonLabel]) {

            const capitalised = fns.capitalize(buttonLabel);

            // NOTE:: Tem `nav` no nome
            this[`handler${capitalised}Nav_onClick`]();
        }
    }

    handlerCanvas_onFullscreenchange = () => {

        this.view.toogleFullWindowedImages();

        if (!fns.isMobile()) return;

        this.view.toogleNavigationKeysSize();

        this.view.toogleNavigationStreetKeysSize();

        const history = this.model.getHistory();

        this.view.render(history, this.model.mainInfo);
    }

    handlerFullscreen_onClick = () => {

        // NOTE:: Existem dois controlos:
        // * fullWindowed - Embedded button, para desktop
        // * fullscrenn - `<button hidden>` para mobile

        this.handlerFullWindowed_onClick();
    }

    //#region EmbeddedControls

    handlerFullWindowed_onClick = () => {

        const { canvas } = this.view;

        if (canvas.requestFullscreen === undefined) return;

        if (fns.isFullScreen()) document.exitFullscreen();
        else canvas.requestFullscreen();
    }

    handlerHandsList_onClick = handIndex => {

        this.view.stopPlayback();

        this.model.navigateTo(handIndex);

        this.view.enableShareHand();

        const history = this.model.navigationStreet(this.model.startPhase);

        const chat = this.model.makeChatArray(this.model.startPhase);
        this.view.updateChat({ chat });

        this.finalizeNavigation(history);
    }

    /**
     * * CheckBox
     */
    handleShowBigBlinds_onClick = () => {

        const history = this.model.getHistory();

        if (!history || !this.model.mainInfo) return;

        this.view.render(history, this.model.mainInfo);
    }

    handleSearchHand_onClick = () => {

        const r = this.view.handsList.filterItems();

        this.model.filteredIndexsHH = r?.indexs;

        if (r) {

            this.view.toogleHandSearchFilterVisibility();

            this.view.render(history, this.model.mainInfo, r.hand);

            const history = this.model.navigationStreet(this.model.startPhase);

            const chat = this.model.makeChatArray(this.model.startPhase);
            this.view.updateChat({ chat });

            this.finalizeNavigation(history);
        }
    }

    handleClearHandsFilter_onClick = () => {

        this.model.filteredIndexsHH = null;

        this.view.handsList.clearFilter();

        this.view.toogleHandSearchFilterVisibility();
    }

    handlerShareHand_onClick = async () => {

        this.view.stopPlayback();

        const content = await this.model.shareHand();

        if (!content) return;

        if (content.success) {

            const { link } = content;

            prompt(`Success\n\nLink: ${link}\n\n[CTRL + C] copy to clipboard`, link);

            this.view.disableShareHand();

        } else alert(content.message);
    }

    // #region Hands Navigation

    /**
     * Chamado por handlers da hand navigation que mudam de hand:
     * * handlerPreviousHand_onClick
     * * handlerNextAction_onClick - quando `progress` é ultimo (excluindo "summary")
     * * handlerNextHand_onClick
     */
    otherHandNavCommon() {

        const chat = this.model.makeChatArray(this.model.startPhase);
        this.view.updateChat({ chat });

        this.view.adjustHandsList();

        this.view.enableShareHand();
    }

    handlerPreviousHand_onClick = () => {

        this.view.stopPlayback();

        const { previousHand } = enums.navigation;

        const { history } = this.model.navigation(previousHand);

        this.otherHandNavCommon();

        this.finalizeNavigation(history);
    }

    handlerPreviousAction_onClick = () => {

        this.view.stopPlayback();

        const { previousAction } = enums.navigation;

        const { history } = this.model.navigation(previousAction);

        this.view.updateChat({ navigation: previousAction });

        this.finalizeNavigation(history);
    }

    handlerPlay_onClick = () => {

        const nextActionHandler = this.handlerNextAction_onClick;

        this.view.tooglePlayback(nextActionHandler, this.model);
    };

    handlerNextAction_onClick = ({ fromPlay } = {}) => {

        if (!fromPlay) this.view.stopPlayback();

        this.view.previousAction.setState = 'normal';

        const { nextAction } = enums.navigation;

        const { history, next, kickoff } = this.model.navigation(nextAction);

        const chatParams = { history, navigation: nextAction, kickoff };

        // NOTE:: Náo é sempre 'nextAction', caso seja o ultimo progress da hand é 'nextHand'
        if (next === nextAction) this.view.updateChat(chatParams);
        else this.otherHandNavCommon();

        this.finalizeNavigation(history);
    }

    handlerNextHand_onClick = () => {

        this.view.stopPlayback();

        const { nextHand } = enums.navigation;

        const { history } = this.model.navigation(nextHand);

        this.otherHandNavCommon();

        this.finalizeNavigation(history);
    }
    //#endregion


    // #region Street Navigation

    streetNavCommon(button, phase) {

        this.view.stopPlayback();

        const history = this.model.navigationStreet(phase);

        const chat = this.model.makeChatArray(phase);
        this.view.updateChat({ chat });

        this.finalizeNavigation(history, button);
    }

    handlerPreflopNav_onClick = (button) => {

        this.streetNavCommon(button, enums.phase.preflop);
    }

    handlerFlopNav_onClick = (button) => {

        this.streetNavCommon(button, enums.phase.flop);
    }

    handlerTurnNav_onClick = (button) => {

        this.streetNavCommon(button, enums.phase.turn);
    }

    handlerRiverNav_onClick = (button) => {

        this.streetNavCommon(button, enums.phase.river);
    }

    handlerSummaryNav_onClick = (button) => {

        this.streetNavCommon(button, enums.phase.summary);
    }

    //#endregion

    /**
     * 
     * @param {HistoryT} history 
     * @param {Button} streetButton 
     */
    finalizeNavigation(history, streetButton) {

        const enables = this.model.getNavigationEnables();
        this.view.updateNavigation(enables);

        this.view.turnOffSwitchFeatButtons('street-nav', streetButton);
        const streetParams = {
            enables: this.model.streetEnables(),
            pushed: this.model.streetPushed()
        };
        this.view.updateStreetNavigationUI(streetParams);

        this.view.render(history, this.model.mainInfo);
    }

    handlerSettings_onClick = () => {

        this.view.showSettings();
    }

    handlerStartBySummary_onClick = (checkBox) => {

        this.model.updateLocalStorageSettings({
            name: 'startBySummary',
            value: checkBox.checked
        });
    }

    handlerShowPlayersProfit_onClick = (checkBox) => {

        this.model.updateLocalStorageSettings({
            name: 'showPlayersProfit',
            value: checkBox.checked
        });

        const history = this.model.getHistory();

        if (!history || !this.model.mainInfo) return;

        this.view.render(history, this.model.mainInfo);
    }

    handlerCloseSettings_onClick = () => {

        // NOTE:: Náo pode ser `closeSettings` por é o nome do button
        this.view.hideSettings();
    }

    //#endregion
}