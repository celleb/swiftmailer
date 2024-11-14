import { DynamicModule, Module } from "@nestjs/common";
import { SwiftMailOptions } from "@swiftmail/mail";
import { SwiftMailService } from "./swift-mail.service";
@Module({})
export class SwiftMailModule {
  static forRoot(options: SwiftMailOptions): DynamicModule {
    return {
      module: SwiftMailModule,
      providers: [
        {
          provide: SwiftMailService,
          useValue: new SwiftMailService(options),
        },
      ],
      exports: [SwiftMailService],
    };
  }

  static forFeature(options: SwiftMailOptions): DynamicModule {
    return {
      module: SwiftMailModule,
      providers: [
        {
          provide: SwiftMailService,
          useFactory: () => new SwiftMailService(options),
        },
      ],
      exports: [SwiftMailService],
    };
  }
}
