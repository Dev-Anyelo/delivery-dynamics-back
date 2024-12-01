import * as z from "zod";

const RouteSchema = z.object({
  id: z.number(),
  driverId: z.number({ required_error: "El campo es requerido" }).min(1, {
    message: "El campo es requerido",
  }),
  date: z.string(),
  notes: z.string().nullable(),
  orders: z.array(
    z.object({
      id: z.number(),
      sequence: z.number(),
      value: z.number(),
      priority: z.boolean(),
    })
  ),
});

export { RouteSchema };
