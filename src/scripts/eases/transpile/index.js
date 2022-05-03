import natural8 from './sites/natural8';
import bills from './sites/bills';

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

            return bills(log, hero);
        }

        return log;
    }
}