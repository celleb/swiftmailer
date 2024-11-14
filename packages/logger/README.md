## @swiftmail/logger

A simple console logger with colors.

### Installation

```bash
pnpm add @swiftmail/logger
```

### Usage

```typescript
import { Logger } from "@swiftmail/logger";

const logger = new Logger();
```

### Scoping

You can scope the logger to a specific module or feature.

```typescript
const logger = new Logger({ scope: "auth" });
```

### Methods

#### `info(message: string, ...args: any[])`

Log an info message.

```typescript
logger.info("This is an info message");
```

##### output

> [12:00:00] <span style="color: green">INFO</span> [auth]: <span style="color: green">This is an info message</span>

#### `warn(message: string, ...args: any[])`

Log a warning message.

```typescript
logger.warn("This is a warning message");
```

##### output

> [12:00:00] <span style="color: yellow">WARN</span> [auth]: <span style="color: yellow">This is a warning message</span>

#### `error(message: string, ...args: any[])`

Log an error message.

```typescript
logger.error("This is an error message");
```

##### output

> [12:00:00] <span style="color: red">ERROR</span> [auth]: <span style="color: red">This is an error message</span>

#### `debug(message: string, ...args: any[])`

Log a debug message.

```typescript
logger.debug("This is a debug message");
```

##### output

> [12:00:00] <span style="color: blue">DEBUG</span> [auth]: <span style="color: blue">This is a debug message</span>
