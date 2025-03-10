import { z } from "zod";

import {
  OperationType,
  PointOfInterestType,
  PaymentMethodType,
  OrderStatus,
} from "@prisma/client";

// Enums
export const OperationTypeEnum = z.nativeEnum(OperationType);
export const PointOfInterestTypeEnum = z.nativeEnum(PointOfInterestType);
export const PaymentMethodTypeEnum = z.nativeEnum(PaymentMethodType);

// --- ReasonSchema ---
export const ReasonSchema = z.object({
  id: z.string(),
  labelEn: z.string(),
  labelEs: z.string(),
});

// --- BankSchema ---
export const BankSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  paymentMethods: z.array(z.lazy(() => PaymentMethodSchema)).optional(),
});

// --- TruckTypeSchema ---
export const TruckTypeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  label: z.string(),
  size: z.number(),
  maxCases: z.number(),
  maxValue: z.number(),
  maxVolume: z.number(),
  maxWeight: z.number(),
  notes: z.string().optional(),
  trucks: z.array(z.lazy(() => TruckSchema)).optional(),
  routes: z.array(z.lazy(() => RouteSchema)).optional(),
});

// --- TruckSchema ---
export const TruckSchema = z.object({
  id: z.string(),
  label: z.string().optional().nullable(),
  truckTypeId: z.string().nullable(),
  truckType: z
    .lazy(() => TruckTypeSchema)
    .optional()
    .nullable(),
  plans: z.array(z.lazy(() => PlanSchema)).optional(),
  routes: z.array(z.lazy(() => RouteSchema)).optional(),
});

// --- RouteStopSchema ---
export const RouteStopSchema = z.object({
  routeId: z.string(),
  route: z.lazy(() => RouteSchema),
  addressId: z.string(),
  address: z.lazy(() => AddressSchema),
  sequence: z.number(),
});

// --- RouteSchema ---
export const RouteSchema: z.ZodType<any> = z.object({
  id: z.string(),
  routeGroupId: z.string(),
  routeGroup: z.lazy(() => RouteGroupSchema),
  startPointId: z.string(),
  endPointId: z.string(),
  assignedTruckId: z.string().optional(),
  assignedTruck: z
    .lazy(() => TruckSchema)
    .optional()
    .nullable(),
  assignedTruckTypeId: z.string().optional(),
  assignedTruckType: z
    .lazy(() => TruckTypeSchema)
    .optional()
    .nullable(),
  assignedUserId: z.string(),
  stops: z.array(z.lazy(() => RouteStopSchema)).optional(),
  plans: z.array(z.lazy(() => PlanSchema)).optional(),
});

// --- RouteGroupSchema ---
export const RouteGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  routes: z.array(z.lazy(() => RouteSchema)).optional(),
});

// --- OrderGroupSchema ---
export const OrderGroupSchema: z.ZodType<any> = z.object({
  id: z.string(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

// --- SalesRepresentativeSchema ---
export const SalesRepresentativeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

// --- LineItemSchema ---
export const LineItemSchema: z.ZodType<any> = z.object({
  id: z.string().nullable(),
  orderId: z.string().nullable().optional(),
  order: z
    .lazy(() => OrderSchema)
    .optional()
    .nullable(),
  productId: z.string().nullable().optional(),
  product: z
    .lazy(() => ProductSchema)
    .optional()
    .nullable(),
  lineNumber: z.number().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  taxRate: z.number(),
  value: z.number().optional().nullable(),
  actualQuantity: z.number(),
  actualValue: z.number(),
  status: z.string(),
  returnedReasonId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// --- ProductSchema ---
export const ProductSchema: z.ZodType<any> = z.object({
  id: z.string(),
  description: z.string().optional(),
  lineItems: z.array(z.lazy(() => LineItemSchema)).optional(),
});

// --- PaymentMethodSchema ---
export const PaymentMethodSchema = z.object({
  id: z.string(),
  method: PaymentMethodTypeEnum,
  value: z.number(),
  documentId: z.string().optional(),
  bankId: z.string().optional(),
  bank: z
    .lazy(() => BankSchema)
    .optional()
    .nullable(),
  accountNumber: z.string().optional(),
  visitId: z.string(),
  visit: z.lazy(() => VisitSchema),
});

// --- DeliveryReassignmentSchema ---
export const DeliveryReassignmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  fromDeliveryPlanId: z.string(),
  fromOrderGroupId: z.string().optional(),
  toDeliveryPlanId: z.string(),
  toOrderGroupId: z.string().optional(),
  orderValue: z.number(),
  timestamp: z.date(),
  visitId: z.string(),
  visit: z.lazy(() => VisitSchema),
});

// --- OrderSchema ---
export const OrderSchema: z.ZodType<any> = z.object({
  id: z.string().nullable(),
  planId: z.string(),
  plan: z
    .lazy(() => PlanSchema)
    .optional()
    .nullable(), // si no se envía, es opcional
  customerId: z.string(),
  customer: z
    .lazy(() => CustomerSchema)
    .optional()
    .nullable(),
  addressId: z.string().nullable(),
  address: z
    .lazy(() => AddressSchema)
    .optional()
    .nullable(),
  salesRepresentativeId: z.string().nullable().optional(),
  salesRepresentative: z
    .lazy(() => SalesRepresentativeSchema)
    .optional()
    .nullable(),
  serviceDate: z.coerce.date(),
  orderGroupId: z.string().nullable().optional(),
  orderGroup: z
    .lazy(() => OrderGroupSchema)
    .optional()
    .nullable(),
  startPointId: z.string().nullable().optional(),
  businessSegmentId: z.string().nullable(),
  businessSegment: z
    .lazy(() => BusinessSegmentSchema)
    .optional()
    .nullable(),
  value: z.number(),
  volume: z.number().nullable(),
  weight: z.number().nullable(),
  cases: z.number().nullable(),
  instructions: z.string().nullable().optional(),
  requiresSignature: z.boolean(),
  actualValue: z.number(),
  notes: z.string().nullable().optional(),
  status: z.nativeEnum(OrderStatus),
  statusConfirmed: z.boolean().nullable(),
  statusTimestamp: z.coerce.date().optional().nullable(),
  deliveryVisitId: z.string().nullable().optional(),
  deliveryVisit: z
    .lazy(() => VisitSchema)
    .optional()
    .nullable(),
  pickupVisitId: z.string().nullable().optional(),
  pickupVisit: z
    .lazy(() => VisitSchema)
    .optional()
    .nullable(),
  lineItems: z.array(z.lazy(() => LineItemSchema)).optional(),
});

// --- VisitSchema ---
export const VisitSchema: z.ZodType<any> = z.object({
  id: z.string().nullable(),
  sequence: z.number().nullable(),
  planId: z.string().nullable().optional(),
  plan: z
    .lazy(() => PlanSchema)
    .optional()
    .nullable(),
  customerId: z.string().nullable(),
  customer: z
    .lazy(() => CustomerSchema)
    .optional()
    .nullable(),
  addressId: z.string().nullable(),
  address: z
    .lazy(() => AddressSchema)
    .optional()
    .nullable(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
  pickupOrders: z.array(z.lazy(() => OrderSchema)).optional(),
  paymentMethods: z.array(z.lazy(() => PaymentMethodSchema)).optional(),
  reassignedDeliveries: z
    .array(z.lazy(() => DeliveryReassignmentSchema))
    .optional(),
});

// --- PlanSchema ---
export const PlanSchema: z.ZodType<any> = z.object({
  id: z.string(),
  businessSegmentId: z.string().nullable(),
  operationType: OperationTypeEnum,
  startPointId: z.string(),
  startPoint: z.lazy(() => PointOfInterestSchema),
  endPointId: z.string(),
  endPoint: z.lazy(() => PointOfInterestSchema),
  truckId: z.string().optional(),
  truckTypeId: z.string().nullable(),
  routeId: z.string().nullable(),
  routeGroupId: z.string().nullable(),
  truck: z
    .lazy(() => TruckSchema)
    .optional()
    .nullable(),
  date: z.coerce.date(),
  plannedStartTimestamp: z.coerce.date().nullable().optional(),
  plannedEndTimestamp: z.coerce.date().nullable().optional(),
  plannedTotalTimeH: z.number().nullable().optional(),
  plannedDriveTimeH: z.number().nullable().optional(),
  plannedServiceTimeH: z.number().nullable().optional(),
  plannedWaitTimeH: z.number().nullable().optional(),
  plannedBreakTimeH: z.number().nullable().optional(),
  plannedEndBreakTimeH: z.number().nullable().optional(),
  plannedDistanceKm: z.number().nullable().optional(),
  actualStartTimestamp: z.coerce.date().nullable().optional(),
  actualEndTimestamp: z.coerce.date().nullable().optional(),
  startLatitude: z.number().nullable().optional(),
  startLongitude: z.number().nullable().optional(),
  endLatitude: z.number().nullable().optional(),
  endLongitude: z.number().nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
  activeDates: z.array(z.coerce.date()),
  batchId: z.string().nullable().optional(),
  enableTelematicsGps: z.boolean(),
  enableAutoArrival: z.boolean(),
  enableAutoStart: z.boolean(),
  numHelpers: z.number(),
  visits: z.array(z.lazy(() => VisitSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

// --- PlansSchema (array de PlanSchema) ---
export const PlansSchema = z.array(PlanSchema);

// --- BusinessSegmentSchema ---
export const BusinessSegmentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  plans: z.array(z.lazy(() => PlanSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

// --- TimeWindowSchema ---
export const TimeWindowSchema: z.ZodType<any> = z.object({
  id: z.string(),
  openingTime: z.date(),
  closingTime: z.date(),
  firstForAddresses: z.array(z.lazy(() => AddressSchema)).optional(),
  secondForAddresses: z.array(z.lazy(() => AddressSchema)).optional(),
});

// --- AddressSchema ---
export const AddressSchema: z.ZodType<any> = z.object({
  id: z.string(),
  label: z.string().nullable(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  notes: z.string().nullable().optional(),
  contact: z.string().nullable(),
  businessType: z.string(),
  customerId: z.string().optional(),
  customer: z.lazy(() => CustomerSchema).optional(),
  firstDeliveryTimeWindowId: z.string().optional(),
  firstDeliveryTimeWindow: z
    .lazy(() => TimeWindowSchema)
    .optional()
    .nullable(),
  secondDeliveryTimeWindowId: z.string().optional(),
  secondDeliveryTimeWindow: z
    .lazy(() => TimeWindowSchema)
    .optional()
    .nullable(),
  visits: z.array(z.lazy(() => VisitSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
  routeStops: z.array(z.lazy(() => RouteStopSchema)).optional(),
});

// --- CustomerSchema ---
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  addresses: z.array(z.lazy(() => AddressSchema)).optional(),
  visits: z.array(z.lazy(() => VisitSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

// --- PointOfInterestSchema ---
export const PointOfInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  type: PointOfInterestTypeEnum,
  startPlans: z.array(z.lazy(() => PlanSchema)).optional(),
  endPlans: z.array(z.lazy(() => PlanSchema)).optional(),
});
