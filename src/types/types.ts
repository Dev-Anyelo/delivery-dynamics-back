import * as z from "zod";

import {
  LineItemSchema,
  OrderSchema,
  PlanSchema,
  VisitSchema,
} from "../schemas/schemas";

export type Plan = z.infer<typeof PlanSchema>;
export type Visit = z.infer<typeof VisitSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
