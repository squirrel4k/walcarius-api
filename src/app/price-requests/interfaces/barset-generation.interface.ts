import { PriceRequest } from "./price-request.interface";
import { AmalgamParam } from "./amalgam.interface";

export interface BarsetGeneration {
    id?: number;
    beamLength?: number;
    beamOtherLengths?: number[];
    beamIsAutoCut?: boolean;
    beamCutThreshold?: number;
    beamMaxLoss?: number;
    tubeLength?: number;
    tubeOtherLengths?: number[];
    tubeIsAutoCut?: boolean;
    tubeCutThreshold?: number;
    tubeMaxLoss?: number;
    generationDuration?: number;
    partsTotalLength?: number;
    amalgamsTotalLength?: number;
    partsQuantity?: number;
    totalLoss?: number;
    lossPercent?: number;
    amalgamsQuantity?: number;
    priceRequestId?: number;
    createdAt?: Date;
    priceRequest?: PriceRequest;
}

export interface BarsetGenerationInput {
    beamLength?: number;
    beamOtherLengths?: number[];
    beamIsAutoCut?: boolean;
    beamCutThreshold?: number;
    beamMaxLoss?: number;
    tubeLength?: number;
    tubeOtherLengths?: number[];
    tubeIsAutoCut?: boolean;
    tubeCutThreshold?: number;
    tubeMaxLoss?: number;
    generationDuration?: number;
    partsTotalLength?: number;
    amalgamsTotalLength?: number;
    partsQuantity?: number;
    amalgamsQuantity?: number;
    totalLoss?: number;
    lossPercent?: number;
    priceRequestId?: number;
}

export interface BarsetGenerationUpdate {
    id?: number;
    beamLength?: number;
    beamOtherLengths?: number[];
    beamIsAutoCut?: boolean;
    beamCutThreshold?: number;
    beamMaxLoss?: number;
    tubeLength?: number;
    tubeOtherLengths?: number[];
    tubeIsAutoCut?: boolean;
    tubeCutThreshold?: number;
    tubeMaxLoss?: number;
    generationDuration?: number;
    partsTotalLength?: number;
    amalgamsTotalLength?: number;
    partsQuantity?: number;
    amalgamsQuantity?: number;
    totalLoss?: number;
    lossPercent?: number;
}

export interface GqlBarsetGenerationUpdate {
    id: number;
    params: AmalgamParam;
    generationDuration?: number;
    partsTotalLength?: number;
    amalgamsTotalLength?: number;
    partsQuantity?: number;
    amalgamsQuantity?: number;
}