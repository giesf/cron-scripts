import axios, { AxiosError } from "axios";
import type { VercelDNSRecord, VercelDNSRecordCreationDTO } from "./vercel.types";
import { Agent } from 'http'
const VERCEL_TOKEN = Bun.env.VERCEL_TOKEN
const DOMAIN = Bun.env.VERCEL_DOMAIN
const TEAM_SLUG = Bun.env.VERCEL_TEAM_SLUG

const agent = new Agent({ family: 4 });


const vercel = axios.create({
    baseURL: "https://api.vercel.com",
    headers: {
        Authorization: "Bearer " + VERCEL_TOKEN,
        "Content-Type": "application/json"
    },
    httpAgent: agent
})

const ifconfig = axios.create({
    baseURL: "https://ifconfig.co",
    httpAgent: agent
})


async function getVercelDNSRecords() {
    const res = await vercel.get(`/v4/domains/${DOMAIN}/records`, {
        params: {
            slug: TEAM_SLUG
        },
    })
    const data = res.data as { records: VercelDNSRecord[] }
    return data.records;
}

async function deleteVercelDNSRecord(record: VercelDNSRecord) {

    const res = await vercel.delete(`/v2/domains/${DOMAIN}/records/${record.id}`, {
        params: {
            slug: TEAM_SLUG
        }
    })

    if (res.status != 200) throw new Error("Record could not be deleted RID: " + record.id)
}

async function getPublicIP() {
    const res = await ifconfig.get("/ip")
    const { data } = res;

    return data.replace("\n", "") as string;
}
async function createVercelDNSRecord(recordCreationDTO: VercelDNSRecordCreationDTO) {
    try {
        const res = await vercel.post(`/v2/domains/${DOMAIN}/records`, recordCreationDTO, {
            params: {
                slug: TEAM_SLUG
            },
        })
        const data = res.data as { uid: string }
        return data.uid;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            console.log(err)
        }
    }
}


async function main() {
    const ip = await getPublicIP();

    console.log("Identified IP as " + ip)

    const records = await getVercelDNSRecords();
    const oldRecords = records.filter(r => r.name == "home" && r.type == "A")

    for (const oldRecord of oldRecords) {
        await deleteVercelDNSRecord(oldRecord);
    }
    console.log("Deteled " + oldRecords.length + " old record(s).")

    const newRecordId = await createVercelDNSRecord({
        name: "home",
        type: "A",
        ttl: 60,
        value: ip,
        comment: `Automatically created at ${(new Date()).toLocaleDateString("DE")}`
    })

    console.log("Successfully created updated record as " + newRecordId)
}

main();