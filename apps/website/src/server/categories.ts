import { createServerFn } from '@tanstack/react-start';
import { baseProcedure } from './db';

export const getAllCategories = createServerFn({ method: 'GET' })
  .middleware([baseProcedure])
  .handler(async ({ context }) => {

    const categories = await context.db.find({
      collection: 'categories',
      limit: 100,
      depth: 1,
      sort: 'name',
    });

    return categories.docs;
  });
