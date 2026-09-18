import { HttpException } from '@nestjs/common';
export declare class ResearchNotFoundException extends HttpException {
    constructor(message?: string);
}
export declare class ResearchAlreadyExistsException extends HttpException {
    constructor(message?: string);
}
export declare class SerpApiException extends HttpException {
    constructor(message?: string);
}
export declare class LlmException extends HttpException {
    constructor(message?: string);
}
export declare class PineconeException extends HttpException {
    constructor(message?: string);
}
export declare class EmbeddingException extends HttpException {
    constructor(message?: string);
}
export declare class ReportNotFoundException extends HttpException {
    constructor(message?: string);
}
