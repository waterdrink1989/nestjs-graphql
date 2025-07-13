/* eslint-disable @typescript-eslint/no-explicit-any */

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
import axios, { AxiosRequestConfig } from "axios";

export interface ApiRequest<TParams = any, TBody = any> {
    method: HTTPMethod;
    url: string;
    params?: TParams;
    data?: TBody;
    headers?: Record<string, string>;
}

export const withAuth = (token: string) => ({
    accept: "application/json",
    "x-verkada-auth": token,
});

export const get = (url: string, headers?: any, params?: any): ApiRequest => ({
    method: "GET",
    url,
    headers,
    params,
});

export const post = (url: string, headers?: any, data?: any): ApiRequest => ({
    method: "POST",
    url,
    headers,
    data,
});

export const call = async (req: ApiRequest) => {
    console.log(`[🔄 Verkada API Call] ${req.method} ${req.url}`);
    try {
        const res = await axios({
            ...req,
            timeout: 10000,
        } as AxiosRequestConfig);

        console.log("✅ Status:", res.status);
        console.log("📦 Response nem:", JSON.stringify(res.data)?.slice(0, 200));
        return res.data;
    } catch (err) {
        console.error("❌ Failed to call Verkada API");

        if (typeof err === "object" && err !== null && "response" in err) {
            const response = (err as any).response;
            console.error("📛 Status:", response?.status);
            console.error("📄 Headers:", response?.headers);
            console.error("🧾 Data:", response?.data);
        } else if (typeof err === "object" && err !== null && "request" in err) {
            console.error("🛑 No response received (timeout/network?)");
        } else if (err instanceof Error) {
            console.error("⚠️ Error:", err.message);
        }

        return null; // prevent crash, caller must handle null
    } finally {
        // console.groupEnd();
    }
};
