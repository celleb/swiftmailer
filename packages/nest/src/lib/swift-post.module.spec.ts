import { DynamicModule } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import path from "path";
import { SwiftPostModule } from "./swift-post.module";
import { SwiftPostService } from "./swift-post.service";

describe("SwiftPostModule", () => {
  describe("forRoot", () => {
    it("returns a module with the SwiftPostService", async () => {
      const module = await getModuleRef([SwiftPostModule.forRoot({})]);
      const service = module.get(SwiftPostService);
      expect(service).toBeInstanceOf(SwiftPostService);
      module.close();
    });

    it("returns the same instance of SwiftPostService", async () => {
      const module = await getModuleRef([SwiftPostModule.forRoot({})]);
      const service = module.get(SwiftPostService);
      const service2 = module.get(SwiftPostService);
      expect(service).toEqual(service2);
      module.close();
    });

    it("uses config from params", async () => {
      const module = await getModuleRef([
        SwiftPostModule.forRoot({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: "yf3uhj7rt6zbczsb@ethereal.email",
            pass: "PASSWORD  ",
          },
          from: "yf3uhj7rt6zbczsb@ethereal.email",
        }),
      ]);
      const service = module.get(SwiftPostService);
      expect(service.config).toEqual({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "yf3uhj7rt6zbczsb@ethereal.email",
          pass: "PASSWORD  ",
        },
        from: "yf3uhj7rt6zbczsb@ethereal.email",
      });
    });
  });

  describe("forFeature", () => {
    it("returns a module with the SwiftPostService", async () => {
      const module = await getModuleRef([
        SwiftPostModule.forFeature({
          templatesDir: path.join(__dirname, "templates"),
        }),
      ]);
      const service = module.get(SwiftPostService);
      expect(service).toBeInstanceOf(SwiftPostService);
      module.close();
    });

    it("returns the same instance of SwiftPostService", async () => {
      const module = await getModuleRef([
        SwiftPostModule.forFeature({
          templatesDir: path.join(__dirname, "templates"),
        }),
      ]);
      const service = module.get(SwiftPostService);
      const service2 = module.get(SwiftPostService);
      expect(service).toEqual(service2);
      module.close();
    });

    it("uses config from params", async () => {
      const module = await getModuleRef([
        SwiftPostModule.forFeature({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: "yf3uhj7rt6zbczsb@ethereal.email",
            pass: "PASSWORD  ",
          },
          from: "yf3uhj7rt6zbczsb@ethereal.email",
        }),
      ]);
      const service = module.get(SwiftPostService);
      expect(service.config).toEqual({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "yf3uhj7rt6zbczsb@ethereal.email",
          pass: "PASSWORD  ",
        },
        from: "yf3uhj7rt6zbczsb@ethereal.email",
      });
    });
  });
});

function getModuleRef(imports: DynamicModule[]) {
  return Test.createTestingModule({
    imports,
  }).compile();
}

function withEnv(env: Record<string, string>) {
  const originalEnv = process.env;
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  return () => {
    Object.entries(env).forEach(([key]) => {
      delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
  };
}
