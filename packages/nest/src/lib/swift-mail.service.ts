import { Injectable, Logger } from "@nestjs/common";
import SwiftPost, { SwiftPostOptions } from "@swiftpost/mail";

@Injectable()
export class SwiftPostService extends SwiftPost {
  private readonly _logger = new Logger(SwiftPostService.name);
  constructor(readonly config: SwiftPostOptions = {}) {
    super(config);
  }
}
