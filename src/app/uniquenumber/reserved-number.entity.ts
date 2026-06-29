import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { NUMBER_TYPE } from "./uniquenumber.interface";

@Entity("reserved_numbers")
@Unique(["type", "username"])
export class ReservedNumber {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "tinyint" })
    type: NUMBER_TYPE;

    @Column({ length: 255 })
    username: string;

    @Column({ length: 64 })
    number: string;
}
