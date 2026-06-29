export interface IpurchaseOrderAdmissionLog{
    id?: number,
    quantity?: number 
    date?: Date 
    location?: string 
    admitedBy?: string
    idElement?: number
}


export interface PurchaseOrderAdmissionLogInput {
    quantity?: number 
    date?: Date 
    location?: string 
    admitedBy?: string
    idElement?: number
}