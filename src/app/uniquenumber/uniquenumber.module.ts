import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UniqueNumberService } from "./uniquenumber.service";
import { ReservedNumber } from "./reserved-number.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ReservedNumber])
    ],
    providers: [
        UniqueNumberService
    ],
    exports: [
        UniqueNumberService
    ]
})
export class UniqueNumberModule {}
