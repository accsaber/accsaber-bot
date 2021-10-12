export default class Util {
    public static isValidScoreSaberID(ID: string): boolean {
        return !(isNaN(parseInt(ID)) || ID.length < 15 || ID.length > 17);
    };

    /**
     * @param {string} scoreSaber A ScoreSaber ID or profile link
     * @return {string | null} The ScoreSaber ID or null if not given a valid ID/profile
     */
    public static extractScoresaberID(scoreSaber: string): string | null {
        // Test if given an ID
        if (this.isValidScoreSaberID(scoreSaber)) {
            return scoreSaber;
        }

        // If not, see if argument is of form */u/ID*
        const startOfID = scoreSaber.indexOf('/u/');
        if (startOfID !== -1) {
            scoreSaber = scoreSaber.slice(startOfID + 3);
        } else {
            return null;
        }

        // The ID will be followed by either ? or & (or nothing)
        // Find the index of the first character found (or -1)
        // TODO: Replace with neater regex match
        const possibleEndOfID = scoreSaber.indexOf('?');
        const possibleEndOfID2 = scoreSaber.indexOf('&');
        let endOfID;
        if (possibleEndOfID === -1) {
            endOfID = possibleEndOfID2;
        } else {
            if (possibleEndOfID2 === -1) {
                endOfID = possibleEndOfID;
            } else {
                endOfID = possibleEndOfID < possibleEndOfID2 ? possibleEndOfID : possibleEndOfID2;
            }
        }

        // Slice to the first ? or & if one was found
        if (endOfID !== -1) {
            scoreSaber = scoreSaber.slice(0, endOfID);
        }

        return Util.isValidScoreSaberID(scoreSaber) ? scoreSaber : null;
    }
}
