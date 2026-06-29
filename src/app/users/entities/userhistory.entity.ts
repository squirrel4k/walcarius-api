import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity({ name: "loginHistories" })
export class UserHistorySql {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45 })
    public fromIp: string;

    @Column("int")
    public loginId: number;
}