import { HttpException, HttpStatus } from '@nestjs/common';

export class ResearchNotFoundException extends HttpException {
  constructor(message = 'Research session not found') {
    super(
      { code: 'RESEARCH_NOT_FOUND', message },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ResearchAlreadyExistsException extends HttpException {
  constructor(message = 'Research session already exists') {
    super(
      { code: 'RESEARCH_ALREADY_EXISTS', message },
      HttpStatus.CONFLICT,
    );
  }
}

export class SerpApiException extends HttpException {
  constructor(message = 'SerpApi request failed') {
    super(
      { code: 'SERPAPI_ERROR', message },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class LlmException extends HttpException {
  constructor(message = 'LLM request failed') {
    super(
      { code: 'LLM_ERROR', message },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class PineconeException extends HttpException {
  constructor(message = 'Pinecone operation failed') {
    super(
      { code: 'PINECONE_ERROR', message },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class EmbeddingException extends HttpException {
  constructor(message = 'Embedding generation failed') {
    super(
      { code: 'EMBEDDING_ERROR', message },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class ReportNotFoundException extends HttpException {
  constructor(message = 'Report not found') {
    super(
      { code: 'REPORT_NOT_FOUND', message },
      HttpStatus.NOT_FOUND,
    );
  }
}
