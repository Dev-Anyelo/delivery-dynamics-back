import { z } from "zod";

import {
  OperationType,
  PointOfInterestType,
  PaymentMethodType,
} from "@prisma/client";

// Enums
export const OperationTypeEnum = z.nativeEnum(OperationType);
export const PointOfInterestTypeEnum = z.nativeEnum(PointOfInterestType);
export const PaymentMethodTypeEnum = z.nativeEnum(PaymentMethodType);

// Schemas
export const ReasonSchema = z.object({
  id: z.string(),
  labelEn: z.string(),
  labelEs: z.string(),
});

export const BankSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  paymentMethods: z.array(z.lazy(() => PaymentMethodSchema)).optional(),
});

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

export const TruckSchema = z.object({
  id: z.string(),
  label: z.string(),
  truckTypeId: z.string(),
  truckType: z.lazy(() => TruckTypeSchema),
  plans: z.array(z.lazy(() => PlanSchema)).optional(),
  routes: z.array(z.lazy(() => RouteSchema)).optional(), // Relación "AssignedTruck"
});

export const RouteStopSchema = z.object({
  routeId: z.string(),
  route: z.lazy(() => RouteSchema),
  addressId: z.string(),
  address: z.lazy(() => AddressSchema),
  sequence: z.number(),
});

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

export const RouteGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  routes: z.array(z.lazy(() => RouteSchema)).optional(),
});

export const OrderGroupSchema: z.ZodType<any> = z.object({
  id: z.string(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

export const SalesRepresentativeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

export const ProductSchema: z.ZodType<any> = z.object({
  id: z.string(),
  description: z.string().optional(),
  lineItems: z.array(z.lazy(() => LineItemSchema)).optional(),
});

export const LineItemSchema: z.ZodType<any> = z.object({
  id: z.string(),
  orderId: z.string(),
  order: z.lazy(() => OrderSchema),
  productId: z.string(),
  product: z.lazy(() => ProductSchema),
  lineNumber: z.number(),
  quantity: z.number(),
  unitPrice: z.number(),
  taxRate: z.number(),
  value: z.number(),
  actualQuantity: z.number(),
  actualValue: z.number(),
  status: z.string(),
  returnedReasonId: z.string().optional(),
  notes: z.string().optional(),
});

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

export const OrderSchema: z.ZodType<any> = z.object({
  id: z.string(),
  planId: z.string(),
  plan: z.lazy(() => PlanSchema),
  customerId: z.string(),
  customer: z.lazy(() => CustomerSchema),
  addressId: z.string(),
  address: z.lazy(() => AddressSchema),
  salesRepresentativeId: z.string().optional(),
  salesRepresentative: z
    .lazy(() => SalesRepresentativeSchema)
    .optional()
    .nullable(),
  serviceDate: z.date(),
  orderGroupId: z.string().optional(),
  orderGroup: z
    .lazy(() => OrderGroupSchema)
    .optional()
    .nullable(),
  startPointId: z.string().optional(),
  businessSegmentId: z.string(),
  businessSegment: z.lazy(() => BusinessSegmentSchema),
  value: z.number(),
  volume: z.number(),
  weight: z.number(),
  cases: z.number(),
  instructions: z.string().optional(),
  requiresSignature: z.boolean(),
  actualValue: z.number(),
  notes: z.string().optional(),
  status: z.string(),
  statusConfirmed: z.boolean(),
  statusTimestamp: z.date().optional(),
  deliveryVisitId: z.string().optional(),
  deliveryVisit: z
    .lazy(() => VisitSchema)
    .optional()
    .nullable(),
  pickupVisitId: z.string().optional(),
  pickupVisit: z
    .lazy(() => VisitSchema)
    .optional()
    .nullable(),
  lineItems: z.array(z.lazy(() => LineItemSchema)).optional(),
});

export const VisitSchema: z.ZodType<any> = z.object({
  id: z.string(),
  sequence: z.number(),
  planId: z.string(),
  plan: z.lazy(() => PlanSchema),
  customerId: z.string(),
  customer: z.lazy(() => CustomerSchema),
  addressId: z.string(),
  address: z.lazy(() => AddressSchema),
  deliveryOrders: z.array(z.lazy(() => OrderSchema)).optional(),
  pickupOrders: z.array(z.lazy(() => OrderSchema)).optional(),
  paymentMethods: z.array(z.lazy(() => PaymentMethodSchema)).optional(),
  reassignedDeliveries: z
    .array(z.lazy(() => DeliveryReassignmentSchema))
    .optional(),
});

export const PlanSchema: z.ZodType<any> = z.object({
  id: z.string(),
  operationType: OperationTypeEnum,
  date: z.date(),
  activeDates: z.array(z.date()),
  assignedUserId: z.string(),
  businessSegmentId: z.string(),
  businessSegment: z.lazy(() => BusinessSegmentSchema),
  routeId: z.string().optional(),
  route: z
    .lazy(() => RouteSchema)
    .optional()
    .nullable(),
  truckId: z.string().optional(),
  truck: z
    .lazy(() => TruckSchema)
    .optional()
    .nullable(),
  startPointId: z.string(),
  startPoint: z.lazy(() => PointOfInterestSchema),
  endPointId: z.string(),
  endPoint: z.lazy(() => PointOfInterestSchema),
  plannedStartTimestamp: z.date(),
  plannedEndTimestamp: z.date(),
  plannedTotalTimeH: z.number(),
  plannedDriveTimeH: z.number(),
  plannedServiceTimeH: z.number(),
  plannedBreakTimeH: z.number(),
  plannedWaitTimeH: z.number(),
  plannedDistanceKm: z.number(),
  actualStartTimestamp: z.date().optional(),
  actualEndTimestamp: z.date().optional(),
  startLatitude: z.number().optional(),
  startLongitude: z.number().optional(),
  endLatitude: z.number().optional(),
  endLongitude: z.number().optional(),
  visits: z.array(z.lazy(() => VisitSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

export const BusinessSegmentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  plans: z.array(z.lazy(() => PlanSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

export const TimeWindowSchema: z.ZodType<any> = z.object({
  id: z.string(),
  openingTime: z.date(),
  closingTime: z.date(),
  firstForAddresses: z.array(z.lazy(() => AddressSchema)).optional(),
  secondForAddresses: z.array(z.lazy(() => AddressSchema)).optional(),
});

export const AddressSchema: z.ZodType<any> = z.object({
  id: z.string(),
  label: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string(),
  notes: z.string().optional(),
  contact: z.string(),
  businessType: z.string(),
  customerId: z.string(),
  customer: z.lazy(() => CustomerSchema),
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

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  addresses: z.array(z.lazy(() => AddressSchema)).optional(),
  visits: z.array(z.lazy(() => VisitSchema)).optional(),
  orders: z.array(z.lazy(() => OrderSchema)).optional(),
});

export const PointOfInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  type: PointOfInterestTypeEnum,
  startPlans: z.array(z.lazy(() => PlanSchema)).optional(),
  endPlans: z.array(z.lazy(() => PlanSchema)).optional(),
});
