/* eslint-disable @typescript-eslint/no-explicit-any */

// Utility to generate standardized error response
import { Response } from "express";
import HTTPStatus from "http-status";
import { getMessage } from "../global";

export const createErrorStatus = (status: number, error_key: string, error: any = null) => ({
    result: "fail",
    status,
    msg: getMessage(error_key),
    ...(error && { error }),
});

export const sendErrorResponse = async (res: Response, err: any): Promise<void> => {
    const status = err.status || HTTPStatus.INTERNAL_SERVER_ERROR;

    // Handle `err.text()` if present
    if (typeof err?.text === "function") {
        try {
            const text = await err.text();
            res.status(status).send(text);
        } catch (innerErr) {
            res.status(status).json({ error: innerErr });
        }
        return;
    }

    // Default error response
    const message = err?.message || err;
    res.status(status).json({ error: message });
};

export type HookNextFunction = (error?: Error) => void;
