import { Injectable, Logger } from "@nestjs/common";
import SwiftMail, { SwiftMailOptions } from "@swiftmail/mail";

@Injectable()
export class SwiftMailService extends SwiftMail {
  private readonly _logger = new Logger(SwiftMailService.name);
  constructor(readonly config: SwiftMailOptions = {}) {
    super(config);
  }
}
