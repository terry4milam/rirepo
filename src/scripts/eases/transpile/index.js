import natural8 from './sites/natural8';
import bills from './sites/bills';
import billsV2 from './sites/bills-v2';

export default {

    /**
     * 
     * @param {string} log 
     * @param {string} [hero] hero username
     */
    transpile(log, hero) {

        // Natural8
        if (log.startsWith('Poker Hand #')) {

            // return natural8()

            return natural8(log);
        }

        // Bills
        const searchPatternBills = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(|\t| )Round #/;
        if (searchPatternBills.test(log)) {

            // NOTE:: Tem stacks actualizadas no fim de uma hand, mas não tem nome
            const isV1 = /Seat \d: .+ \(.+ in chips\)$/gm.test(log);

            if (isV1) return bills(log, hero);
            else return billsV2(log, hero);
        }

        return log;
    }
}