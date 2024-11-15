import { DynamicModule, Module } from "@nestjs/common";
import { SwiftPostOptions } from "@swiftpost/mail";
import { SwiftPostService } from "./swift-post.service";
@Module({})
export class SwiftPostModule {
  static forRoot(options: SwiftPostOptions): DynamicModule {
    return {
      module: SwiftPostModule,
      providers: [
        {
          provide: SwiftPostService,
          useValue: new SwiftPostService(options),
        },
      ],
      exports: [SwiftPostService],
    };
  }

  static forFeature(options: SwiftPostOptions): DynamicModule {
    return {
      module: SwiftPostModule,
      providers: [
        {
          provide: SwiftPostService,
          useFactory: () => new SwiftPostService(options),
        },
      ],
      exports: [SwiftPostService],
    };
  }
}
