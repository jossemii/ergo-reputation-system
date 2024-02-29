import type { Amount, Box } from "@fleet-sdk/core";

export interface ReputationProof {
    token_id: string,
    current_boxes: RPBox[],
    total_amount: number,
    number_of_boxes: number
}

export interface RPBox {
    box: Box<Amount>,
    box_id: string,
    token_id: string,
    token_amount: number
}