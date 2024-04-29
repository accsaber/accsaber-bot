/* eslint-disable new-cap */
import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class RewardIdentifier extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({unique: true})
    public scoreSaberID!: string;
}
