import "server-only";
import { OutboxService, EnqueueOutboxInput } from "@/lib/communications/services/outbox.service";

export class CommunicationOutboxService {
  public static async enqueueEvent(input: EnqueueOutboxInput) {
    return OutboxService.enqueue(input);
  }
}
