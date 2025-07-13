import { ErrorKeys } from "./error_keys";

export const enErrorMessages: Record<ErrorKeys, string> = {
    [ErrorKeys.NO_MESSAGE]: "No additional message was provided.",
    [ErrorKeys.DAO_NOT_FOUND]: "The requested data was not found.",
    [ErrorKeys.DAO_BAD_REQUEST]: "The data access request was malformed.",
    [ErrorKeys.DAO_DB_OPERATION_ERROR]: "An internal database operation failed.",
    [ErrorKeys.INVALID_DATA]: "The provided data is invalid.",
    [ErrorKeys.INVALID_ID]: "ID is invalid.",
    [ErrorKeys.INVALID_ORDER]: "The order of data is incorrect.",
    [ErrorKeys.INVALID_DUPLICATE]: "Data is duplicated.",
    [ErrorKeys.INVALID_UNPROCESSABLE_ENTITY]:
        "The entity could not be processed due to semantic errors.",
    [ErrorKeys.RESOURCE_NOT_FOUND]: "The requested resource does not exist.",

    [ErrorKeys.VERKADA_APIKEY_INVALID]: "Verkada API key is invalid.",
    [ErrorKeys.VERKADA_TIMEOUT]: "The request to Verkada timed out. Please try again later.",
    [ErrorKeys.VERKADA_BAD_REQUEST]: "The request to Verkada was invalid.",
    [ErrorKeys.VERKADA_TOKEN_EXPIRED]: "Verkada token expired.",
};
