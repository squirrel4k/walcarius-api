import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { SmtpConfig } from "../interfaces/smtp-config.interface";

@Entity({ name: "smtpConfig" })
export class SmtpConfigSql implements SmtpConfig {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public loginId: number;

    @Column({ length: 255 })
    public username: string;

    @Column({ length: 255 })
    public email: string;

    @Column({ length: 255 })
    public password: string;

    @Column({ length: 255, nullable: true})
    public host: string;

    @Column("int")
    public port: number;

    @Column("boolean")
    public active: boolean;
}