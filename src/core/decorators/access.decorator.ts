import { ReflectMetadata } from "@nestjs/common";

export const Access = (...accesses: string[]) => ReflectMetadata("access", accesses);