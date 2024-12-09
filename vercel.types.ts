export type VercelDNSRecord = {
    id: string,
    slug: string,
    name: string,
    type: "A" | "AAAA" | "ALIAS" | "CAA" | "CNAME" | "HTTPS" | "MX" | "SRV" | "TXT" | "NS",
    value: string,
    creator: string,
    created: number,
    updated: number,
    createdAt: number,
    updatedAt: number,
    ttl: number,
    comment: string,
}

export type VercelDNSRecordCreationDTO = Omit<VercelDNSRecord, "id" | "creator" | "created" | "updated" | "createdAt" | "updatedAt" | "slug">