import { DynamicModule } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import path from "path";
import { SwiftMailModule } from "./swift-mail.module";
import { SwiftMailService } from "./swift-mail.service";

describe("SwiftMailModule", () => {
  describe("forRoot", () => {
    it("returns a module with the SwiftMailService", async () => {
      const module = await getModuleRef([SwiftMailModule.forRoot({})]);
      const service = module.get(SwiftMailService);
      expect(service).toBeInstanceOf(SwiftMailService);
      module.close();
    });

    it("returns the same instance of SwiftMailService", async () => {
      const module = await getModuleRef([SwiftMailModule.forRoot({})]);
      const service = module.get(SwiftMailService);
      const service2 = module.get(SwiftMailService);
      expect(service).toEqual(service2);
      module.close();
    });

    it("uses config from params", async () => {
      const module = await getModuleRef([
        SwiftMailModule.forRoot({
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
      const service = module.get(SwiftMailService);
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
    it("returns a module with the SwiftMailService", async () => {
      const module = await getModuleRef([
        SwiftMailModule.forFeature({
          templatesDir: path.join(__dirname, "templates"),
        }),
      ]);
      const service = module.get(SwiftMailService);
      expect(service).toBeInstanceOf(SwiftMailService);
      module.close();
    });

    it("returns the same instance of SwiftMailService", async () => {
      const module = await getModuleRef([
        SwiftMailModule.forFeature({
          templatesDir: path.join(__dirname, "templates"),
        }),
      ]);
      const service = module.get(SwiftMailService);
      const service2 = module.get(SwiftMailService);
      expect(service).toEqual(service2);
      module.close();
    });

    it("uses config from params", async () => {
      const module = await getModuleRef([
        SwiftMailModule.forFeature({
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
      const service = module.get(SwiftMailService);
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
