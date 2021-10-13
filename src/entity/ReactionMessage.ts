/* eslint-disable new-cap */
import {BaseEntity, Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {ReactionRole} from './ReactionRole';

@Entity()
export class ReactionMessage extends BaseEntity {
    @PrimaryColumn()
    public messageID!: string;

    @Column()
    public channelID!: string;

    @OneToMany(() => ReactionRole, (reactionRole) => reactionRole.reactionMessage, {
        cascade: true,
        eager: true,
    })
    public reactionRoles!: ReactionRole[];
}
