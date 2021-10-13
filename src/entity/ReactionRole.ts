/* eslint-disable new-cap */
import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ReactionMessage} from './ReactionMessage';

@Entity()
export class ReactionRole extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @ManyToOne(() => ReactionMessage, (reactionMessage) => reactionMessage.reactionRoles )
    public reactionMessage!: ReactionMessage;

    @Column()
    public emoteID!: string;

    @Column()
    public roleID!: string;
}
