import { testables } from '@/scripts/eases/transpile/sites/bills-v2.js';

const assert = require('assert');

describe('ease-transpile-bills-v2', function () {

    describe('# tryPatchButton', function () {

        // Nesta sala é possivel jogar sem o button estar sentado na mesa... 
        // O button deve ser o player antes da small blind (à direita)
        // Caso seja heads-up, deve ser a small blind

        const fn = testables.tryPatchButton;

        it('heads-up sb should be the button', function () {

            const lines = [
                "Seat 5 posts small blind 10.00 allin:0",
                "Seat 1 posts big blind 20.00 allin:0",
            ];

            const likelyButton = 4;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }
            ];

            const anticipate = 5;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });

        it('3-way "cut off" should be the button', function () {

            const lines = [
                "Seat 5 posts small blind 10.00 allin:0",
                "Seat 1 posts big blind 20.00 allin:0",
            ];

            const likelyButton = 4;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }, { seat: 2 }
            ];

            const anticipate = 2;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });

        it('3-way the player before sb should be the button', function () {

            const lines = [
                "Seat 5 posts small blind 10.00 allin:0",
                "Seat 1 posts big blind 20.00 allin:0",
            ];

            const likelyButton = 3;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }, { seat: 4 }
            ];

            const anticipate = 4;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });

        it('4-way the player before sb should be the button', function () {

            const lines = [
                "Seat 5 posts small blind 10.00 allin:0",
                "Seat 1 posts big blind 20.00 allin:0",
            ];

            const likelyButton = 3;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }, { seat: 4 }, { seat: 2 }
            ];

            const anticipate = 4;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });

        it('3-way the player before sb should be the button', function () {

            const lines = [
                "Seat 1 posts small blind 10.00 allin:0",
                "Seat 3 posts big blind 20.00 allin:0",
            ];

            const likelyButton = 7;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }, { seat: 3 }
            ];

            const anticipate = 5;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });


    });


    describe('# makePlayersStacks', function () {

        const fn = testables.makePlayersStacks;

        it('should return only players stacks lines fixed', function () {

            const lines = [
                'Round #21192687: Omaha Pot Limit - 2022-05-20 22:58:30',
                'Omaha Pot Limit, SB:15.00 BB:30.00 Ante:12.00',
                'Table:1500-6000 ףלק5, 6-max Seat #4 is the dealer.',
                'Seat 5 SB Caesar (1,383.30 in chips)',
                'Seat 6 BB gswen (6,330.45 in chips)',
                'Seat 1 UTG aaaa55 (20,194.45 in chips)',
                'Seat 3 CO BadSyntax (5,153.85 in chips)',
                'Seat 4 BTN Koral (5,931.00 in chips)',
                'posts ante (5 player 12.00)',
                'Seat 5 posts small blind 15.00 allin:0',
                'Seat 6 posts big blind 30.00 allin:0',
                '*** HOLE CARDS ***',
                'Seat 1: (13,864.00 in chips)',
                'Seat 3: (5,141.85 in chips)',
                'Seat 4: (5,754.00 in chips)',
                'Seat 5: (1,356.30 in chips)',
                'Seat 6: (12,786.90 in chips)'
            ];

            const anticipate = [
                'Seat 5: Caesar (1383.30 in chips) ',
                'Seat 6: gswen (6330.45 in chips) ',
                'Seat 1: aaaa55 (20194.45 in chips) ',
                'Seat 3: BadSyntax (5153.85 in chips) ',
                'Seat 4: Koral (5931 in chips) ',
            ];

            assert.deepStrictEqual(fn(lines), anticipate);
        });


        it('should return only players stacks lines fixed', function () {

            const lines = [
                `Round #21495433:  Holdem No Limit - 2022-05-23 08:48:00`,
                `Holdem No Limit, SB:2.50 BB:5.00 Ante:0.00`,
                `Table:200-750 םדלוה, 6-max Seat #6 is the dealer.`,
                `Seat 7 SB LouisVitton (936.00 in chips)`,
                `Seat 8 BB Barna5h (255.00 in chips)`,
                `Seat 1 UTG solomon77 (560.07 in chips)`,
                `Seat 2 UTG+1 edisanta (993.79 in chips)`,
                `Seat 3 MP vivo47 (286.09 in chips)`,
                `Seat 4 MP+1 PokerProfesr (938.92 in chips)`,
                `Seat 5 CO Inbar (270.40 in chips)`,
                `Seat 6 BTN Lolololo (525.00 in chips)`,
                `Seat 7 posts small blind 2.50 allin:0`,
                `Seat 8 posts big blind 5.00 allin:0`,
                `*** HOLE CARDS ***`,
                `Seat 7, SB`,
                `Seat 6: Lolololo [Tc 7s] (dealer) Folded on the Pre Flop`,
                `Seat 1:  (560.07 in chips)`,
                `Seat 2:  (993.79 in chips)`,
                `Seat 3:  (241.09 in chips)`,
                `Seat 4:  (938.92 in chips)`,
                `Seat 5:  (270.40 in chips)`,
                `Seat 6:  (525.00 in chips)`,
                `Seat 7:  (891.00 in chips)`,
                `Seat 8:  (338.25 in chips)`,
                `Seat 5: [Qh bb] allin:0`,
            ];

            const anticipate = [
                `Seat 7: LouisVitton (936 in chips) `,
                `Seat 8: Barna5h (255 in chips) `,
                `Seat 1: solomon77 (560.07 in chips) `,
                `Seat 2: edisanta (993.79 in chips) `,
                `Seat 3: vivo47 (286.09 in chips) `,
                `Seat 4: PokerProfesr (938.92 in chips) `,
                `Seat 5: Inbar (270.40 in chips) `,
                `Seat 6: Lolololo (525 in chips) `,
            ];

            assert.deepStrictEqual(fn(lines), anticipate);
        });

    });

    describe('# makePosts', function () {

        const fn = testables.makePosts;

        it('should return posts lines fixed', function () {

            const lines = [
                'Seat 4 BTN Koral (5,931.00 in chips)',
                'posts ante (5 player 12.00)',
                'Seat 5 posts small blind 15.00 allin:0',
                'Seat 6 posts big blind 30.00 allin:0',
                '*** HOLE CARDS ***',
            ];

            const anticipate = [
                'Caesar: posts the ante 12',
                'gswen: posts the ante 12',
                'aaaa55: posts the ante 12',
                'BadSyntax: posts the ante 12',
                'Koral: posts the ante 12',
                'Caesar: posts small blind 15',
                'gswen: posts big blind 30',
            ];

            const seatsNames = [
                { name: 'Caesar', seat: 5 },
                { name: 'gswen', seat: 6 },
                { name: 'aaaa55', seat: 1 },
                { name: 'BadSyntax', seat: 3 },
                { name: 'Koral', seat: 4 },
            ];

            assert.deepStrictEqual(fn(lines, seatsNames), anticipate);
        });

        it('should return posts lines fixed', function () {

            // Com "Seat 3 posts small blind" no nome de um player

            const lines = [
                'Seat 4 BTN Ko Seat 3 posts small blind ral (5,931.00 in chips)',
                'posts ante (5 player 12.00)',
                'Seat 5 posts small blind 15.00 allin:0',
                'Seat 6 posts big blind 30.00 allin:0',
                '*** HOLE CARDS ***',
            ];

            const anticipate = [
                'Caesar: posts the ante 12',
                'gswen: posts the ante 12',
                'aaaa55: posts the ante 12',
                'BadSyntax: posts the ante 12',
                'Ko Seat 3 posts small blind ral: posts the ante 12',
                'Caesar: posts small blind 15',
                'gswen: posts big blind 30',
            ];

            const seatsNames = [
                { name: 'Caesar', seat: 5 },
                { name: 'gswen', seat: 6 },
                { name: 'aaaa55', seat: 1 },
                { name: 'BadSyntax', seat: 3 },
                { name: 'Ko Seat 3 posts small blind ral', seat: 4 },
            ];

            assert.deepStrictEqual(fn(lines, seatsNames), anticipate);
        });
    });


    describe('# makeActivity', function () {

        const fn = testables.makeActivity;

        it('should return only activity lines fixed and streets', function () {

            const lines = [
                'Dealt to Seat 3 [Jc Td Th 9h 5h]',
                'Dealt to Seat 4 [Ks 8s 5s 5c 2c]',
                'Seat 1 raise 165.00 (Button Click) Total Bet:165.00',
                'Seat 3 fold (Button Reserve)',
                'Seat 4 call 165.00 (Button Click) Total Bet:165.00',
                'Seat 5 fold (Button Click)',
                'Seat 6 raise 704.99 (Button Click) Total Bet:734.99',
                'Seat 2 Wineandine RE-JOIN',
                'Seat 2 Wineandine - Sit Out',
                'Seat 1 raise 2,279.97 (Button Click) Total Bet:2,444.97',
                'Seat 4 fold (Button Click)',
                'Seat 6 call 1,709.98 (Button Click) Total Bet:2,444.97',
                '*** FLOP *** [6c 4s 8h]',
                'Seat 6 all-in 3,873.48 (Button Click) Total Bet:3,873.48',
                'Seat 1 call 3,873.48 (Button Click) Total Bet:3,873.48',
                'Seat 1: [As Ac Js 7d 7h] allin:1',
                'Seat 6: [Ad 9s 9d 7s 5d] allin:1',
                'Seat 6 Ew:91.49%(Favorite)',
                'Seat 1 Ew:8.50%(Underdog)',
                'Seat 1 aaaa55 - Request RIT(Twice)',
                'Seat 6 gswen - Decline',
                '*** TURN *** [6c 4s 8h] [6h]',
                'Seat 6 Ew:89.47%(Favorite)',
                'Seat 1 Ew:10.52%(Underdog)',
                '*** RIVER *** [6c 4s 8h 6h] [8d]',
                'Seat 6 Ew:100.00%(Favorite)',
                'Seat 1 Ew:0.00%(Underdog)',
                '*** SHOW DOWN ***',
                'Seat 6: [Ad 9s 9d 7s 5d] allin:1',
                'Seat 1: [As Ac Js 7d 7h] allin:1',
                '*** SUMMARY ***',
            ];

            const anticipate = [
                'aaaa55: raises to 165',
                'BadSyntax: folds',
                'Koral: calls 165',
                'Caesar: folds',
                'gswen: raises to 734.99',
                'aaaa55: raises to 2444.97',
                'Koral: folds',
                'gswen: calls 1709.98',
                '*** FLOP *** [6c 4s 8h]',
                'gswen: bets 3873.48 and is all-in',
                'aaaa55: calls 3873.48',
                '*** TURN *** [6c 4s 8h] [6h]',
                '*** RIVER *** [6c 4s 8h 6h] [8d]',
            ];

            const seatsNames = [
                { name: 'aaaa55', seat: 1 },
                { name: 'BadSyntax', seat: 3 },
                { name: 'Koral', seat: 4 },
                { name: 'Caesar', seat: 5 },
                { name: 'gswen', seat: 6 },
            ];

            assert.deepStrictEqual(fn(lines, seatsNames), anticipate);
        });


        it('should return only activity lines fixed and streets', function () {

            const lines = [
                'Seat 3 UTG check (5,153.85 in chips)',
                'Dealt to Seat 3 [Jc Td Th 9h 5h]',
                'Dealt to Seat 4 [Ks 8s 5s 5c 2c]',
                'Seat 1 raise 165.00 (Button Click) Total Bet:165.00',
                'Seat 3 fold (Button Reserve)',
                'Seat 4 call 165.00 (Button Click) Total Bet:165.00',
                'Seat 5 fold (Button Click)',
                'Seat 6 raise 704.99 (Button Click) Total Bet:734.99',
                'Seat 2 fold (Button Click) RE-JOIN',               // chama-se fold
                'Seat 2 fold - Sit Out',                            // chama-se fold
                'Seat 1 raise 2,279.97 (Button Click) Total Bet:2,444.97',
                'Seat 4 fold (Button Click)',
                'Seat 6 call 1,709.98 (Button Click) Total Bet:2,444.97',
                '*** FLOP *** [6c 4s 8h]',
                'Seat 6 all-in 3,873.48 (Button Click) Total Bet:3,873.48',
                'Seat 1 call 3,873.48 (Button Click) Total Bet:3,873.48',
                'Seat 1: [As Ac Js 7d 7h] allin:1',
                'Seat 6: [Ad 9s 9d 7s 5d] allin:1',
                'Seat 6 Ew:91.49%(Favorite)',
                'Seat 1 Ew:8.50%(Underdog)',
                'Seat 1 aaaa55 - Request RIT(Twice)',
                'Seat 6 gswen - Decline',
                '*** TURN *** [6c 4s 8h] [6h]',
                'Seat 6 Ew:89.47%(Favorite)',
                'Seat 1 Ew:10.52%(Underdog)',
                '*** RIVER *** [6c 4s 8h 6h] [8d]',
                'Seat 6 Ew:100.00%(Favorite)',
                'Seat 1 Ew:0.00%(Underdog)',
                '*** SHOW DOWN ***',
                'Seat 6: [Ad 9s 9d 7s 5d] allin:1',
                'Seat 1: [As Ac Js 7d 7h] allin:1',
                '*** SUMMARY ***',
                'Seat 3: check [Jc Td Th 9h 5h] Folded on the Pre Flop'
            ];

            const anticipate = [
                'aaaa55: raises to 165',
                'check: folds',
                'Koral: calls 165',
                'Caesar: folds',
                'gswen: raises to 734.99',
                'aaaa55: raises to 2444.97',
                'Koral: folds',
                'gswen: calls 1709.98',
                '*** FLOP *** [6c 4s 8h]',
                'gswen: bets 3873.48 and is all-in',
                'aaaa55: calls 3873.48',
                '*** TURN *** [6c 4s 8h] [6h]',
                '*** RIVER *** [6c 4s 8h 6h] [8d]',
            ];

            const seatsNames = [
                { name: 'aaaa55', seat: 1 },
                { name: 'check', seat: 3 },
                { name: 'Koral', seat: 4 },
                { name: 'Caesar', seat: 5 },
                { name: 'gswen', seat: 6 },
            ];

            assert.deepStrictEqual(fn(lines, seatsNames), anticipate);
        });
        it('should return only activity lines fixed and streets', function () {

            const lines = [
                'Seat 1 fold (Button Click)',
                'Seat 2 call 5.00 (Button Click) Total Bet:5.00',
                'Seat 3 raise 7.50 (Button Click) Total Bet:10.00',
                'Seat 6 raise 30.00 (Button Click) Total Bet:35.00',
                'Seat 2 call 30.00 (Button Click) Total Bet:35.00',
                'Seat 3 call 25.00 (Button Click) Total Bet:35.00',
                '*** FLOP *** [Jc 8h Ad]',
                'Seat 3 check (Button Click)',
                'Seat 6 bets 105.00 (Button Click) Total Bet:105.00',
                // NOTE:: tentativa de usar nomes de players como acção
                'Seat 5 returned 0.00 RE-JOIN',
                'Seat 5 Seat 5: returned 0.00 - Sit Out',
                'Seat 2 fold (Button Click)',
                'Seat 3 raise 420.00 (Button Click) Total Bet:420.00',
                'Seat 6 all-in raise 1,080.34 (Button Click) Total Bet:1,185.34',
                'Seat 3 all-in 65.86 (Button Click) Total Bet:485.86',
                'Seat 6: returned 699.48',
            ];

            const anticipate = [
                'a: folds',
                'b: calls 5',
                'c: raises to 10',
                'd: raises to 35',
                'b: calls 30',
                'c: calls 25',
                '*** FLOP *** [Jc 8h Ad]',
                'c: checks',
                'd: bets 105',
                'b: folds',
                'c: raises to 420',
                'd: raises to 1185.34 and is all-in',
                'c: calls 65.86 and is all-in',
                'Uncalled bet (699.48) returned to d',
            ];

            const seatsNames = [
                { name: 'a', seat: 1 },
                { name: 'b', seat: 2 },
                { name: 'c', seat: 3 },
                { name: 'd', seat: 6 },
            ];

            assert.deepStrictEqual(fn(lines, seatsNames), anticipate);
        });



    });


});