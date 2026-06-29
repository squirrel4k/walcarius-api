import * as DataLoader from "dataloader";

export interface NestDataLoader {
    generateDataLoader(): DataLoader<any, any>;
}