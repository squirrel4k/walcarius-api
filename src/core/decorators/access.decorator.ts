import { SetMetadata } from "@nestjs/common";

export const Access = (...accesses: string[]) => SetMetadata("access", accesses);