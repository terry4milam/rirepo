// import { assert } from 'chai';
import { testables } from '@/scripts/eases/transpile/sites/bills.js';

const assert = require('assert');

describe('ease-transpile-bills', function () {

    /*  describe('# getPlayersInfoLines', function () {
 
         const fn = testables.getPlayersInfoLines;
 
         it('should return only Players info lines', function () {
 
             const lines = [
                 "PokerStars Hand #206007536567:  Hold'em No Limit (€0.01/€0.02 EUR) - 2019/11/10 1:11:59 WET [2019/11/09 20:11:59 ET]",
                 "Table 'Akiyama II' 6-max Seat #5 is the button",
                 'Seat 2: vikcch (€2 in chips) ',
                 'Seat 5: ruipinho1 (€5.60 in chips) ',
                 'ruipinho1: posts small blind €0.01',
                 'vikcch: posts big blind €0.02',
                 '*** HOLE CARDS ***',
             ];
 
             const anticipate = [
                 'Seat 2: vikcch (€2 in chips) ',
                 'Seat 5: ruipinho1 (€5.60 in chips) '
             ];
 
             assert.deepStrictEqual(fn(lines), anticipate);
         });
     }); */


    describe('# tryPatchButton', function () {

        // Nesta sala é possivel jogar sem o button estar sentado na mesa... 
        // O button deve ser o player antes da small blind (à direita)
        // Caso seja heads-up, deve ser a small blind

        const fn = testables.tryPatchButton;

        it('heads-up sb should be the button', function () {

            const lines = [
                "Seat 5: posts small blind 10.00 (btn click 0.00) allin:0",
                "Seat 1: posts big blind 20.00 (btn click 0.00) allin:0",
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
                "Seat 5: posts small blind 10.00 (btn click 0.00) allin:0",
                "Seat 1: posts big blind 20.00 (btn click 0.00) allin:0",
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
                "Seat 5: posts small blind 10.00 (btn click 0.00) allin:0",
                "Seat 1: posts big blind 20.00 (btn click 0.00) allin:0",
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
                "Seat 5: posts small blind 10.00 (btn click 0.00) allin:0",
                "Seat 1: posts big blind 20.00 (btn click 0.00) allin:0",
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
                "Seat 1: posts small blind 10.00 (btn click 0.00) allin:0",
                "Seat 3: posts big blind 20.00 (btn click 0.00) allin:0",
            ];

            const likelyButton = 7;

            const seatsNames = [
                { seat: 5 }, { seat: 1 }, { seat: 3 }
            ];

            const anticipate = 5;

            assert.deepStrictEqual(fn(lines, likelyButton, seatsNames), anticipate);
        });


    });




});