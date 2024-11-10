import { Module } from "@nestjs/common";
import { SwiftMail } from "../swift-mail";

@Module({
  providers: [SwiftMail],
  exports: [SwiftMail],
})
export class SwiftMailModule {}
