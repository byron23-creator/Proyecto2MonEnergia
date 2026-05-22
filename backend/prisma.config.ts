import path from 'path';
import { defineConfig } from 'prisma/config';

// prisma 6 config - sets the db url for migrations
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
});
