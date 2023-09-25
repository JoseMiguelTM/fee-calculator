export type Fee = {
    name: string;
    amount: string;
    type: string;
}

export type Distribution = {
    name: string;
    amount: string;
}

export type OrderItem = {
    order_item_type: string;
    fees: Fee[];
    distributions: Distribution[];
}