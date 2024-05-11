export enum EquipmentSlot {
    head = 1,
    body,
    leftHand,
    rightHand,
    ring1,
    ring2,
    amulet,
    legs,
    feet,
    back
}
export const EquipmentSlotNames: Record<EquipmentSlot, string> = {
    [EquipmentSlot.head]: 'equipment/head',
    [EquipmentSlot.body]: 'equipment/body',
    [EquipmentSlot.leftHand]: 'equipment/leftHand',
    [EquipmentSlot.rightHand]: 'equipment/rightHand',
    [EquipmentSlot.ring1]: 'equipment/ring1',
    [EquipmentSlot.ring2]: 'equipment/ring2',
    [EquipmentSlot.amulet]: 'equipment/amulet',
    [EquipmentSlot.legs]: 'equipment/legs',
    [EquipmentSlot.feet]: 'equipment/feet',
    [EquipmentSlot.back]: 'equipment/back'
};

export type EquipmentComponent = {
    items: Partial<Record<EquipmentSlot, number>>;
}