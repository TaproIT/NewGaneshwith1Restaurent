/**
 * @param res - Express Response object.
 * @param statusCode - HTTP status code.
 * @param message - Success message.
 * @param data - Optional data to include in the response.
 */

export const sendSuccessResponse = (res,statusCode,message,data) => {
    res.status(statusCode).json({
        status: "success",
        message,
        data,
        timeStamp: new Date().toISOString()
    })
}

/**
 * @param res - Express Response object.
 * @param statusCode - HTTP status code.
 * @param message - Error message.
 * @param error - Optional error object to include in the response.
 */

export const sendErrorResponse = (res,statusCode,message,error) => {
    res.status(statusCode).json({
        status: "fail",
        message,
        error: error?.message || error,
        timeStamp: new Date().toISOString()
    })
}