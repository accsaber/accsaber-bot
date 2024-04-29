import { AccSaberUser } from "./entity/AccSaberUser";
export default class RewardDistributor {
  private static rewards;
  private static privkey;
  /**
   * Sends any rewards for the given milestone. Returns false on failure. If there are no rewards for a milestone, sending nothing
   * is considered success.
   * @param {AccSaberUser} accSaberUser
   * @param {number} milestoneId
   */
  static sendRewards(
    accSaberUser: AccSaberUser,
    milestoneId: number
  ): Promise<boolean>;
  /**
   * @param {string} scoreSaberID
   * @param {Buffer} reward
   * @param {number} sigOffset
   * @param {string} rewardName
   */
  private static signReward;
}
