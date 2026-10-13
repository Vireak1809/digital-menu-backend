declare module '@prisma/client' {
  export type Role = 'ADMIN' | 'STAFF' | 'CHEF';
  export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED';
  export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

  export class PrismaClient {
    constructor(options?: Record<string, unknown>);
    [key: string]: any;
  }

  export const Prisma: {
    PrismaClientKnownRequestError: new (...args: any[]) => any;
  };
}

declare module '@prisma/client/runtime/library' {
  export class Decimal {
    static isDecimal(value: unknown): value is Decimal;
    toNumber(): number;
  }
}
