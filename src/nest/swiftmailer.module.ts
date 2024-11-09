import { Module } from "@nestjs/common";
import { SwiftMailer } from "../swift-mailer";

@Module({
  providers: [SwiftMailer],
  exports: [SwiftMailer],
})
export class SwiftMailerModule {}
