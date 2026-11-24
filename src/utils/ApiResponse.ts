export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;

  constructor(statusCode: number, data?: T, message: string = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static ok<T>(data: T, message: string = 'Operation successful') {
    return new ApiResponse(200, data, message);
  }

  static created<T>(data: T, message: string = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message: string = 'Resource deleted successfully') {
    return new ApiResponse(204, undefined, message);
  }
}

