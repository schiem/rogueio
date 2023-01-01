export type InventoryComponent = {
    items: {id: number, weight: number}[];
    currentWeight: number;
    maxSpace: number;
    maxWeight: number;
}