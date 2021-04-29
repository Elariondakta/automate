import { Guild } from './guild.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from './user.entity';


export enum MessageType {
  PONCTUAL,
  FREQUENTIAL
}

@Entity()
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ length: 18 })
  public channelId: string;

  @Column({ length: 14, nullable: true })
  public cron: string;

  @Column("timestamp", { nullable: true })
  public timestamp: number;

  @Column("text")
  public parsedMessage: string;

  @Column("text")
  public rawMessage: string;

  @Column("text")
  public description: string;

  @Column({ type: "enum", enum: MessageType })
  public type: MessageType;

  @ManyToOne(() => Guild)
  @JoinColumn()
  public guild: Guild;

  @ManyToOne(() => User)
  @JoinColumn()
  public creator: User;
}