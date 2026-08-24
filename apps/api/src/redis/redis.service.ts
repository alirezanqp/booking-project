import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6380");

  onModuleDestroy() {
    this.client.disconnect();
  }
}
