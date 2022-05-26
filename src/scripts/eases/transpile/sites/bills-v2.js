// NOTE:: v2, as hand histories sofreram algumas alterações.. 
// funções alteradas em relaçao a v1:
// * tryPatchButton,
// * makePlayersStacks,
// * makePosts,
// * makeActivity

/**
 * 
 * Cria um jagged array 
 * 
 * @param {string[]} allLines 
 * @returns {string[][]}
 */
const splitFullLogLines = allLines => {

    // NOTE:: Para simplificar o index e ou initIndex 
    allLines.push('');

    return allLines.reduce((acc, cur, index, arr) => {

        if (cur === '' || index === arr.length - 1) {

            acc.result.push(arr.slice(acc.initIndex, index));
            acc.initIndex = index + 1;
        }

        return acc;

    }, { result: [], initIndex: 0 }).result.filter(v => v.length);
};

/**
 * 
 * @param {string[]} lines 
 * @param {string} likelyButton 
 * @param {{seat:number; name:string}[] } seatsNames 
 * @returns {Number} button seat
 */
const tryPatchButton = (lines, likelyButton, seatsNames) => {

    const hasLikelyButton = seatsNames.some(v => v.seat === Number(likelyButton));

    if (hasLikelyButton) return likelyButton;

    // NOTE:: Diferente de v1, não tem ":" depois de "Seat x"
    const sbPost = lines.filter(v => /^Seat \d posts small blind /.test(v));
    const sbSeat = Number(`${sbPost}`.charAt(5));

    if (seatsNames.length === 2) return sbSeat;

    const orderedSeats = seatsNames.map(({ seat }) => (seat)).sort((a, b) => a - b);
    const sbIndex = orderedSeats.indexOf(sbSeat);

    if (sbIndex - 1 >= 0) return orderedSeats[sbIndex - 1];
    else return orderedSeats[orderedSeats.length - 1];
};


/**
 * 
 * input lines:    
 * Round #1043080: Omaha Pot Limit - 2022-04-01 03:46:39
 * Omaha Pot Limit, SB:15.00 BB:30.00 Ante:12.00
 * Table:1500-6000 ףלק5, 6-max Seat #1 is the dealer.
 * 
 * output:
 * Round #1043080: Omaha Pot Limit (15/30) - 2022/04/01 03:46:39
 * Table '1500-6000 6' 5-max Seat #1 is the button
 * 
 * @param {string[]} lines 
 * @param {{seat:number; name:string}[]} seatsNames 
 * @returns {string[]} com length de 2
 */
const makeHeader = (lines, seatsNames) => {

    const firstLineIn = lines[0];
    const secondLineIn = lines[1].replace(/,/g, '');
    const trirdLineIn = lines[2];

    // NOTE:: positive lookbehind com suporte para 75% dos browsers
    // Nao remove os decimais aquando o separador de milhares porque 
    // tinha de ter regex para os dois casos, com e sem separador
    const bb = /(?<=BB:)\d+.\d+/.exec(secondLineIn)[0].replace('.00', '');
    const sb = /(?<=SB:)\d+.\d+/.exec(secondLineIn)[0].replace('.00', '');

    const firstLineOut = firstLineIn.replace('-', `(${sb}/${bb}) -`).replace(/(?<=\d\d)-/g, '/');

    const likelyButton = /(?<=Seat #)\d/.exec(trirdLineIn);
    const button = tryPatchButton(lines, likelyButton, seatsNames);

    const tableName = /(?<=\:).*(?=\,)/.exec(trirdLineIn);

    // NOTE:: Tem caracteres invalidos na string... 
    const tableMax = /(?<=\,)\d/.exec(trirdLineIn);

    const secondLineOut = `Table '${tableName}' ${tableMax ?? 9}-max Seat #${button} is the button`;

    return [firstLineOut, secondLineOut];
};


/**
 * 
 * input lines:
 * Seat 3 SB Caesar (9,616.16 in chips)
 * Seat 4 BB gswen (6,000.00 in chips)
 * ...
 * Seat 2: (6984.54 in chips)
 * Seat 3: (9574.16 in chips)
 * NOTE:: No fim da hand tem linhas similares
 * 
 * output:
 * Seat 3: poker900500 (9616.16 in chips)
 * Seat 4: 007Bond (6000 in chips)
 * 
 * @param {string[]} lines 
 */
const makePlayersStacks = lines => {

    // Tem separador de milhares ","
    const dirtyStacks = lines.filter(v => /^Seat \d .+ \(.+ in chips\)$/g.test(v));

    const stacks = dirtyStacks.map(line => {

        const lastIndexOfStartParentheses = line.lastIndexOf('(');

        const dirtyStack = line.slice(lastIndexOfStartParentheses);

        // Seat 3 SB Caesar 
        const seatPositionName = line.slice(0, lastIndexOfStartParentheses);

        // NOTE:: Não posso usar só `\w` porque pode haver "UTG+1", etc
        const seatAndName = seatPositionName.replace(/(?<=Seat \d) \w+|(\+\d)/g, (match) => {

            return match.startsWith('+') ? '' : ':';
        });

        const withFormatedStack = dirtyStack.replace(/,/g, '').replace('.00', '');

        return `${seatAndName}${withFormatedStack} `;
    });

    return stacks;
};

/**
 * 
 * @param {string[]} lines Linhas dos seats, nomes e stacks, criado por `makePlayersStacks()`
 * @returns { {seat:number; name:string}[] }
 */
const setSeatsNames = lines => {

    return lines.map(line => {

        const lastIndexOfStartParentheses = line.lastIndexOf('(');

        const seatAndName = line.slice(0, lastIndexOfStartParentheses);

        const seat = Number(seatAndName.charAt(5));

        const name = seatAndName.slice(8).trim();

        return { seat, name };
    });
};

/**
 * Posts das antes e blinds
 * 
 * lines input:
 * posts ante (5 player 12.00)
 * Seat 5 posts small blind 15.00 allin:0
 * Seat 6 posts big blind 30.00 allin:0
 * NOTE:: posts ante (5 player 12.00) -> Todos os players (5) postam ante de 12
 * 
 * output:
 * vikcch: posts the ante 3750
 * Rasputin744: posts the ante 3750
 * vikcch: posts small blind 15000
 * Rasputin744: posts big blind 30000
 * 
 * 
 * @param {string[]} lines 
 * @param { {seat:number; name:string}[] } seatsNames 
 * @returns {string[]}
 */
const makePosts = (lines, seatsNames) => {

    const makeAntes = anteLine => {

        if (!anteLine) return [];

        const anteFormatedLine = anteLine.replace(/,/g, '').replace('.00', '');

        const ante = /(?<=player ).+(?=\)$)/.exec(anteFormatedLine);

        return seatsNames.map(v => `${v.name}: posts the ante ${ante}`);
    };

    const anteLine = lines.find(v => /^posts ante \(\d+/.test(v));

    const antes = makeAntes(anteLine);

    const postsLines = lines.filter(v => {

        const isSmall = /^Seat \d posts small blind /.test(v);
        const isBig = /^Seat \d posts big blind /.test(v);

        // NOTE:: Funcionou right away com pretendido, mesmo sem suporte previo
        const isPost = /^Seat \d posts post blind /.test(v);

        return isSmall || isBig || isPost;
    });

    const posts = postsLines.map(line => {

        const numberFormatedLine = line.replace(/,/g, '').replace('.00', '');

        const indexOfAllin = numberFormatedLine.lastIndexOf('allin:');

        const withoutClickTime = numberFormatedLine.slice(0, indexOfAllin - 1);

        const seat = Number(line.charAt(5));

        const { name } = seatsNames.find(v => v.seat === seat);

        return withoutClickTime.replace(`Seat ${seat}`, `${name}:`);
    });

    return [...antes, ...posts];
};

/**
 * 
 * lines input:
 * Dealt to Seat 6 [Qs Qh]
 * Dealt to Seat 2 [Kh Jh]
 * Dealt to Seat 3 [Ah Th]
 * 
 * output
 * Dealt to vik [As Ac]           <- hero
 * Dealted to rita [7d 7h]
 * Dealted to joana [Ts Tc]
 * 
 * @param {string[]} lines 
 * @param { {seat:number; name:string}[] } seatsNames 
 * @param {string} hero 
 * @returns {string[]}
 */
const makeHoleCards = (lines, seatsNames, hero) => {

    const dealtLines = lines.filter(v => /^Dealt to Seat \d \[.+\]$/.test(v));

    const withDealted = dealtLines.map(line => {

        const seat = Number(line.charAt(14));

        const lineUsername = seatsNames.find(v => v.seat === seat)?.name;

        const isHero = lineUsername === hero;

        const withUsername = line.replace(`Seat ${seat}`, lineUsername);

        if (!isHero) return withUsername.replace('Dealt', 'Dealted');

        return withUsername;
    });

    // NOTE:: O hero tem que ficar em primeiro (Dealt)
    let heroLine = withDealted.find(v => v.startsWith('Dealt '));

    if (!heroLine) {

        heroLine = withDealted.shift();
        heroLine = heroLine.replace('Dealted', 'Dealt');
        // alert('Random hero was provided');
    }

    const nonHeroLines = withDealted.filter(v => v.startsWith('Dealted'));

    return ['*** HOLE CARDS ***', heroLine, ...nonHeroLines];
};

/**
 * 
 * lines input:
 * *** FLOP *** [4c Qs 7d]
 * Seat 3 check (Button Click)
 * Seat 1 fold (Button Click)
 * Seat 1 call 3,873.48 (Button Click) Total Bet:3,873.48
 * Seat 3 raise 75.00 (Button Click) Total Bet:105.00
 * Seat 6 bets 105.00 (Button Click) Total Bet:105.00
 * Seat 6 all-in raise 1,080.34 (Button Click) Total Bet:1,185.34
 * Seat 6 all-in 3,873.48 (Button Click) Total Bet:3,873.48      <- bets
 * Seat 3 all-in 65.86 (Button Click) Total Bet:485.86           <- calls
 * Seat 6: returned 699.48                                       <- com ":"
 * 
 * NOTE:: Diferenças da v1:
 * * Não tem ":", exexpto returned
 * * Mosta sempre a acçao primeiro (raise, call, bets)
 * * Adicionado total bet no fim da linha
 * * Parenteses com "(Button Click)" sem valor
 * 
 * * v1
 * Seat 5: 195.00 raise (btn click 195.00)
 * Seat 1: 195.00 call (btn click 0.00)
 * Seat 4: 690.00 bets (btn click 0.00)
 * Seat 2: fold (btn click)
 * Seat 4: check (btn click)
 * Seat 2: all-in raise 616.04 (btn click 663.54)
 * Seat 5: all-in 1,378.30 (btn click 0.00)              <- calls
 * Seat 2: all-in 282.23 (btn click 0.00)                <- bets
 * Seat 4: returned 1,261.70
 * 
 * output:
 * joana: checks
 * joana: folds
 * rita: bets 100
 * rita: calls 800
 * rita: bets 100
 * vik: raises to 1000 and is all-in
 * rita: calls 400 and is all-in
 * Uncalled bet (500) returned to vik
 * 
 * 
 * @param {string[]} lines 
 * @param { {seat:number; name:string}[] } seatsNames 
 */
const makeActivity = (lines, seatsNames) => {

    const activity = lines.filter(line => {

        const streets = ['*** FLOP ***', '*** TURN ***', '*** RIVER ***'];

        if (streets.some(v => line.startsWith(v))) return true;

        const commalessLine = line.replace(/,/g, '');

        if (/^Seat \d check \(Button .+\)$/.test(commalessLine)) return true;
        if (/^Seat \d fold \(Button .+\)$/.test(commalessLine)) return true;
        if (/^Seat \d raise \d+\.\d+ .+\d$/.test(commalessLine)) return true;
        if (/^Seat \d call \d+\.\d+ .+\d$/.test(commalessLine)) return true;
        if (/^Seat \d bets \d+\.\d+ .+\d$/.test(commalessLine)) return true;

        if (/^Seat \d all-in raise \d+\.\d+ .+\d$/.test(commalessLine)) return true;
        if (/^Seat \d all-in \d+\.\d+ .+\d$/.test(commalessLine)) return true;

        if (/^Seat \d: returned \d+\.\d+$/.test(commalessLine)) return true;
    });

    const patchActivity = activity.map((line, index) => {

        const streets = ['*** FLOP ***', '*** TURN ***', '*** RIVER ***'];

        if (streets.some(v => line.startsWith(v))) return line;

        const commalessLine = line.replace(/,/g, '');

        // NOTE:: O amount "raise to" está no final em "Total Bet:", "calls" e "bets" é o 
        // primeiro valor, o (btn click 0.00) está a zero
        const possibleAmount = line.includes('raise')
            ? /(?<=\(Button Click\) Total Bet\:)\d+\.\d+$/.exec(commalessLine)
            : /\d+\.\d+/.exec(commalessLine);

        const amount = possibleAmount ? possibleAmount[0].replace('.00', '') : '';

        const withoutButtonClick = commalessLine.slice(0, commalessLine.indexOf('(') - 1);

        const withoutAmount = withoutButtonClick.replace(/ \d+\.\d+/, '');

        const seatPart = withoutAmount.slice(0, 6);

        if (withoutAmount.includes('returned')) {

            // Seat 4: returned 1,261.70
            // Uncalled bet (500) returned to vik
            return `Uncalled bet (${amount}) returned to ${seatPart}`;
        }

        if (withoutAmount.includes('all-in')) {

            // NOTE:: O log não faz distinção entre "bets all-in" e "calls all-in" só diz "all-in"
            // Se achar "raise","bets" ou "all-in" até á street ou inicio (a recuar) é "calls" se não "bets"
            const previousActivityRev = activity.slice(0, index + 1).reverse();
            const lastStreetIndex = previousActivityRev.findIndex(v => v.startsWith('***'));
            const currentStreetActivity = previousActivityRev.slice(1, lastStreetIndex + 1);

            const hasAggro = /raise|bets|all-in/.test(currentStreetActivity);

            const betsOrCalls = hasAggro || !(/\*\*\* /.test(currentStreetActivity)) ? 'calls' : 'bets';

            if (withoutAmount.includes('raise')) return `${seatPart} raises to ${amount} and is all-in`;

            else return `${seatPart} ${betsOrCalls} ${amount} and is all-in`;

        } else {

            const patchedAction = withoutAmount.endsWith('bets') ? withoutAmount : `${withoutAmount}s`

            if (patchedAction.endsWith('checks') || patchedAction.endsWith('folds')) return patchedAction;

            // NOTE:: No raise não preciso meter o primeiro valor "raises 500 to 1000"
            // fica raises to 1000
            if (patchedAction.endsWith('raises')) return `${patchedAction} to ${amount}`;

            return `${patchedAction} ${amount}`;
        }
    });

    return patchActivity.map(line => {

        const streets = ['*** FLOP ***', '*** TURN ***', '*** RIVER ***'];

        if (streets.some(v => line.startsWith(v))) return line;

        // NOTE:: Não posso usar charAt() porque no novo "returned" o seat vem no fim
        const seat = Number(/(?<=Seat )\d/.exec(line));
        const { name } = seatsNames.find(v => v.seat === seat);

        // NOTE:: Uncalled bet/return não leva dois pontos depois do nome ":"
        const nameSufix = line.startsWith('Uncalled bet (') ? '' : ':';

        return line.replace(/Seat \d/, `${name}${nameSufix}`);
    });
};

/**
 * 
 * input lines:
 * NOTE:: Tem sempre '*** SHOW DOWN ***' no imput, pode não ter no output
 * *** SHOW DOWN ***    
 * Seat 2: [Qd 2d] 1
 * Seat 3: [Kc Ks] 1
 * *** SUMMARY ***
 * Seat 1 Collects 2,540.00 from main pot           <- diz main pot mesmo quando só há um
 * Seat 2 Collects 322.68 from side pot - 1
 * Seat 5: [cryptobull] - Stand up Withdraw 0.00    <- similar a "shows"
 * 
 * NOTE:: No input o "collected" vem sempre no '*** SUMMARY ***', no output
 * vai no '*** SHOW DOWN ***' caso haja "shows", se não vem depois do "returned"
 * 
 * output:
 * vikcch: shows [2c Kc] (high card King)           <- Não mostra, já estão visiveis desde o inicio
 * Rasputin744: shows [Ad 4d] (high card Ace)
 * 
 * * 2 ou mais side pots
 * "E:\OKVikSoft\Hand History\Tournaments\"
 * HH20120915 T610987291 No Limit Hold'em $2 + $0.20 (com 2 side pots)
 * xxxx collected 2014 from side pot-2         
 * xxxx collected 2508 from side pot-1         
 * xxxx collected 3836 from main pot
 * 
 * * 1 side pot
 * xxxx collected 276 from side pot
 * xxxx collected 11736 from main pot
 *
 * * sem side pot
 * xxxx collected 11750 from pot
 * 
 * @param {string[]} lines 
 * @param { {seat:number; name:string}[] } seatsNames 
 */
const makeShowdown = (lines, seatsNames) => {

    const shows = lines.filter(v => /Seat \d: \[.+\] \d/.test(v));

    // NOTE:: flag `i`, quando é RIT pots collects está com letra minuscula
    const collects = lines.filter(v => /Seat \d Collects/i.test(v) || /^Board \[.+\]$/.test(v));

    // NOTE:: Sem uso, as cartas já estão visiveis desdo o inicio, se incluir,
    // tenho de remover duplicados... as hands estão duplicadas no log
    // const showsPatched = shows.map(line => {

    //     const seat = Number(line.charAt(5));
    //     const { name } = seatsNames.find(v => v.seat === seat);

    //     const hand = /\[.+\]/.exec(line);

    //     return `${name}: shows ${hand}`;
    // });

    // NOTE:: Esta a executar o regex num string[]
    const potsCount = Number(/(?<=Pot Count:)\d/.exec(lines));
    const hasRIT = /(?<=from )RIT-\d/.test(collects);

    const collectedPatched = collects.map(line => {

        const isBoard = /^Board \[.+\]$/.test(line);

        if (isBoard) {

            if (hasRIT) return line;
            else return;
        }

        const commalessLine = line.replace(/,/g, '');

        // NOTE:: Não usar Number para remover decimais, nao tem valor desejado se for .50
        const amount = /\d+\.\d+/.exec(commalessLine)[0].replace('.00', '');

        const seat = Number(line.charAt(5));
        const { name } = seatsNames.find(v => v.seat === seat);

        const ritMatch = /(?<=from )RIT-\d/.exec(line);
        // NOTE:: Não pode acabar com numero, faz conflito com o valor do pot, uso "#"
        const rit = ritMatch ? ` ${ritMatch}#` : ' ';

        if (potsCount === 1) return `${name} collected ${amount} from${rit} pot`;

        if (potsCount === 2) {

            const potType = /(?<=from )\w+/.exec(line);

            return `${name} collected ${amount} from${rit} ${potType} pot`.replace('  ', ' ');
        }

        // Pelo menos 3 pots (2 side pots)
        const potType = /(?<=from )\w+/.exec(line);
        const sidePotCounter = /(?<=from side pot - )\d/.exec(line);

        const trailingCounter = sidePotCounter ? ` - ${sidePotCounter}` : '';

        return `${name} collected ${amount} from${rit} ${potType} pot${trailingCounter}`;
    });

    const showdownLine = shows.length ? ['*** SHOW DOWN ***'] : [];

    // NOTE:: O log está com o "collect" depois do "board", tive que trocar,
    // faz mais sentido visualmente primeiro o board e depois quem colectou
    const boards = collectedPatched.filter(v => /^Board \[.+\]$/.test(v));

    collectedPatched.unshift(collectedPatched.pop());

    const boardsPatched = collectedPatched.map(line => {

        const isBoard = /^Board \[.+\]$/.test(line);

        if (isBoard) return boards.shift();
        else return line;

    }).filter(Boolean);

    return [...showdownLine, ...boardsPatched];
};

/**
 *
 * output: 
 * // Total pot 4000 Main pot 3000. Side pot 1000. | Rake 0
 * // Board [2h 4c 6s 3d Kh]
 * 
 * 
 * @param {string[]} lines 
 */
const makeSummary = (lines) => {

    return ['*** SUMMARY ***'];
};


/**
 * 
 * @param {string} log 
 */
export default function (log, hero) {

    const isSecure = log.includes('\r\n');

    const secureLog = isSecure ? log : log.replace(/\n/g, '\r\n');

    // NOTE:: Slice 20: remove data e hora
    const fullLogLines = secureLog.split('\r\n').map(v => v.trim().slice(20));

    const hands = splitFullLogLines(fullLogLines);

    return hands.map(lines => {

        const playerStacks = makePlayersStacks(lines);

        const seatsNames = setSeatsNames(playerStacks);

        // NOTE:: Depois de seatsNames e playerStacks, tem que forcar um dealer
        const header = makeHeader(lines, seatsNames, posts);

        const posts = makePosts(lines, seatsNames);

        const holeCards = makeHoleCards(lines, seatsNames, hero);

        const activity = makeActivity(lines, seatsNames);

        const showdown = makeShowdown(lines, seatsNames);

        const summary = makeSummary(lines);

        const result = [...header, ...playerStacks, ...posts, ...holeCards, ...activity, ...showdown, ...summary];

        return result.join('\r\n');

    }).join('\r\n\r\n\r\n\r\n');
}


export const testables = {

    tryPatchButton,
    makePlayersStacks,
    makePosts,
    makeActivity
};
