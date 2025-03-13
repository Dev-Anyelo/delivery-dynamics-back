import { z } from "zod";
import axios from "axios";
import cuid from "cuid";
import bcrypt from "bcrypt";
import { db } from "../lib/db";
import config from "../config/config";
import { Request, Response } from "express";
import { PlanSchema, RouteGroupSchema } from "../schemas/schemas";
import { LineItem, Order, PaymentMethod, Plan, Visit } from "../types/types";

// -------- PLANS -------- //

// Get all plans from the external service
export const getExternalPlan = async (id: string): Promise<any> => {
  const { PLAN_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = `${PLAN_EXTERNAL_SERVICE_URL}/${id}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get plan by date and user from the external service
export const getExternalPlanByDateAndUser = async (
  date: string,
  assignedUserId: string
): Promise<any> => {
  const { PLAN_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;
  const url = `${PLAN_EXTERNAL_SERVICE_URL}?date=${date}&assignedUserId=${assignedUserId}`;

  console.log("Llamando a la API externa:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("Respuesta de API externa:", response.status, response.data);
    return response.data;
  } catch (error) {
    console.error("Error en llamada a API externa:", error);
    return handleExternalAPIError(error);
  }
};

// Get plan by date and user form the database
export const fetchPlanByDateAndUserFromDb = async (
  date: string,
  assignedUserId: string
) => {
  try {
    const formattedDate = new Date(date).toISOString();
    return await db.plan.findFirst({
      where: {
        date: formattedDate,
        assignedUserId,
      },
      include: {
        route: true,
        orders: true,
        visits: true,
        startPoint: true,
        endPoint: true,
        truck: true,
        businessSegment: true,
      },
    });
  } catch (error) {
    console.error("Error al consultar plan en la base de datos:", error);
    throw new Error("Error al obtener el plan.");
  }
};

// Get all plans from the database
export const fetchAllPlans = async () => {
  try {
    const plans = await db.plan.findMany({
      include: {
        route: true,
        orders: true,
        visits: true,
        startPoint: true,
        endPoint: true,
        truck: true,
        businessSegment: true,
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      operationType: plan.operationType,
      date: plan.date,
      activeDates: plan.activeDates,
      assignedUserId: plan.assignedUserId,
      businessSegmentId: plan.businessSegmentId,
      businessSegment: plan.businessSegment,
      routeId: plan.routeId,
      route: plan.route,
      truckId: plan.truckId,
      truck: plan.truck,
      startPointId: plan.startPointId,
      startPoint: plan.startPoint,
      endPointId: plan.endPointId,
      endPoint: plan.endPoint,
      plannedStartTimestamp: plan.plannedStartTimestamp,
      plannedEndTimestamp: plan.plannedEndTimestamp,
      plannedTotalTimeH: plan.plannedTotalTimeH,
      plannedDriveTimeH: plan.plannedDriveTimeH,
      plannedServiceTimeH: plan.plannedServiceTimeH,
      plannedBreakTimeH: plan.plannedBreakTimeH,
      plannedWaitTimeH: plan.plannedWaitTimeH,
      plannedDistanceKm: plan.plannedDistanceKm,
      actualStartTimestamp: plan.actualStartTimestamp,
      actualEndTimestamp: plan.actualEndTimestamp,
      startLatitude: plan.startLatitude,
      startLongitude: plan.startLongitude,
      endLatitude: plan.endLatitude,
      endLongitude: plan.endLongitude,
      visits: plan.visits,
      orders: plan.orders,
    }));
  } catch (error) {
    console.error("Error al consultar rutas en la base de datos:", error);
    throw new Error("Error al obtener las rutas.");
  }
};

// Get a plan by ID from the database (Versión Mejorada)
export const fetchPlanByIDFromDB = async (id: string) => {
  try {
    const plan = await db.plan.findUnique({
      where: { id },
      include: {
        route: true,
        orders: {
          include: {
            customer: true,
            address: true,
            salesRepresentative: true,
            orderGroup: true,
            businessSegment: true,
            lineItems: {
              include: {
                product: true,
                returnedReason: true,
              },
            },
          },
        },
        visits: {
          include: {
            customer: {
              include: {
                addresses: true,
              },
            },
            address: true,
            deliveryOrders: {
              include: {
                customer: true,
                address: true,
                salesRepresentative: true,
                orderGroup: true,
                businessSegment: true,
                lineItems: {
                  include: {
                    product: true,
                    returnedReason: true,
                  },
                },
              },
            },
            pickupOrders: {
              include: {
                customer: true,
                address: true,
                salesRepresentative: true,
                orderGroup: true,
                businessSegment: true,
                lineItems: {
                  include: {
                    product: true,
                    returnedReason: true,
                  },
                },
              },
            },
            paymentMethods: true,
            reassignedDeliveries: true,
          },
        },
        startPoint: true,
        endPoint: true,
        truck: {
          include: {
            truckType: true,
          },
        },
        businessSegment: true,
      },
    });

    return plan || null; // Asegurar retorno null si no existe
  } catch (error) {
    console.error("Error en fetchPlanByIDFromDB:", error);
    throw new Error("Error en la consulta de base de datos");
  }
};

// Transform plan from DB to API format (Versión Mejorada)
export const transformPlanFromDB = (plan: Plan) => {
  if (!plan) return null;

  // Helper para manejo seguro de fechas
  const safeDate = (date: Date | null | undefined): string | null => {
    return date instanceof Date ? date.toISOString() : null;
  };

  // Helper para manejar arrays undefined
  const safeArray = <T>(arr: T[] | undefined | null): T[] => arr || [];

  return {
    ...plan,
    // Convertir todas las fechas a strings ISO
    date: safeDate(plan.date),
    activeDates: safeArray(plan.activeDates).map((d) =>
      safeDate(d as Date | null | undefined)
    ),
    plannedStartTimestamp: safeDate(plan.plannedStartTimestamp),
    plannedEndTimestamp: safeDate(plan.plannedEndTimestamp),
    actualStartTimestamp: safeDate(plan.actualStartTimestamp),
    actualEndTimestamp: safeDate(plan.actualEndTimestamp),

    // Transformar visits con valores por defecto
    visits: safeArray(plan.visits).map((visit: Visit) => ({
      ...visit,
      id: visit.id || null,
      sequence: visit.sequence ?? null,
      isReload: false,
      plannedArrivalTimestamp: null,
      plannedDepartureTimestamp: null,
      plannedServiceTimeH: null,
      plannedWaitTimeH: null,
      plannedBreakTimeH: null,
      plannedEarlyTimeH: null,
      plannedLateTimeH: null,
      plannedMissedTimeWindow: null,
      actualArrivalTimestamp: safeDate(visit.actualArrivalTimestamp),
      actualDepartureTimestamp: safeDate(visit.actualDepartureTimestamp),
      skipped: null,
      skippedReasonId: null,
      postponed: null,
      postponedReasonId: null,
      noSales: null,
      noSalesReasonId: null,

      // Customer con datos geográficos consolidados
      customer: visit.customer
        ? {
            ...visit.customer,
            latitude:
              visit.address?.latitude ??
              visit.customer.addresses?.[0]?.latitude ??
              null,
            longitude:
              visit.address?.longitude ??
              visit.customer.addresses?.[0]?.longitude ??
              null,
            address:
              visit.address?.address ??
              visit.customer.addresses?.[0]?.address ??
              null,
            notes: visit.customer.notes || null,
          }
        : null,

      // Orders y pickupOrders con transformación completa
      orders: safeArray(visit.deliveryOrders).map((order: Order) => ({
        ...order,
        date: null,
        cases: order.cases ?? null,
        pallets: null,
        cancelledReasonId: null,
        postponedReasonId: null,
        numberOfLineItems: safeArray(order.lineItems).length,

        lineItems: safeArray(order.lineItems).map((li: LineItem) => ({
          ...li,
          lineNumber: li.lineNumber ?? 0,
          product: li.product || {
            id: "unknown",
            description: "Producto no especificado",
          },
          volume: null,
          weight: null,
          cases: null,
          taxRate: li.taxRate ?? 0,
          returnedReason: li.returnedReason || null,
        })),
      })),

      pickupOrders: safeArray(visit.pickupOrders).map((order: Order) => ({
        ...order,
        // Replicar misma transformación que orders
        date: null,
        cases: order.cases ?? null,
        pallets: null,
        cancelledReasonId: null,
        postponedReasonId: null,
        numberOfLineItems: safeArray(order.lineItems).length,

        lineItems: safeArray(order.lineItems).map((li: LineItem) => ({
          ...li,
          lineNumber: li.lineNumber ?? 0,
          product: li.product || {
            id: "unknown",
            description: "Producto no especificado",
          },
          volume: null,
          weight: null,
          cases: null,
          taxRate: li.taxRate ?? 0,
          returnedReason: li.returnedReason || null,
        })),
      })),

      // Payment methods y reassignments
      paymentMethods: safeArray(visit.paymentMethods as PaymentMethod[]).map(
        (pm: PaymentMethod) => ({
          ...pm,
          documentId: pm.documentId || null,
          bank: pm.bank || null,
          accountNumber: pm.accountNumber || null,
        })
      ),

      reassignedDeliveries: safeArray(visit.reassignedDeliveries).map(
        (rd: any) => ({
          ...rd,
          fromOrderGroupId: rd.fromOrderGroupId || null,
          toOrderGroupId: rd.toOrderGroupId || null,
        })
      ),
    })),

    // Transformación de orders raíz
    orders: safeArray(plan.orders).map((order: Order) => ({
      ...order,
      date: null,
      pallets: null,
      cancelledReasonId: null,
      postponedReasonId: null,
      numberOfLineItems: safeArray(order.lineItems).length,

      lineItems: safeArray(order.lineItems).map((li: LineItem) => ({
        ...li,
        lineNumber: li.lineNumber ?? 0,
        product: li.product || {
          id: "unknown",
          description: "Producto no especificado",
        },
        volume: null,
        weight: null,
        cases: null,
        taxRate: li.taxRate ?? 0,
        returnedReason: li.returnedReason || null,
      })),
    })),

    // Truck con tipo incluido
    truck: plan.truck
      ? {
          ...plan.truck,
          truckType: plan.truck.truckType || null,
        }
      : null,

    // Campos adicionales requeridos
    route: plan.route || null,
    routeGroup: null,
    assignedTruckType: null,
  };
};

// Validate if a plan exists
export const planExists = async (id: string) => {
  return db.plan.findUnique({ where: { id } });
};

// Create a plan by ID
export const createNewPlan = async (data: z.infer<typeof PlanSchema>) => {
  try {
    const plan = await db.plan.create({
      data: {
        id: data.id,
        operationType: data.operationType,
        date: new Date(data.date),
        activeDates: data.activeDates.map((d: string) => new Date(d)),
        assignedUserId: data.assignedUserId ?? undefined,
        // Conexiones opcionales para relaciones simples
        ...(data.businessSegmentId
          ? { businessSegment: { connect: { id: data.businessSegmentId } } }
          : {}),
        ...(data.routeId ? { route: { connect: { id: data.routeId } } } : {}),
        ...(data.truckId
          ? {
              truck: {
                connectOrCreate: {
                  where: { id: data.truckId },
                  create: {
                    id: data.truck?.id || data.truckId,
                    label: data.truck?.label ?? undefined,
                    truckTypeId: data.truck?.truckTypeId ?? null,
                  },
                },
              },
            }
          : {}),
        truckTypeId: data.truckTypeId ?? null,
        routeGroupId: data.routeGroupId ?? null,
        // Los puntos de interés se crean usando nested write sin duplicar campos escalares
        startPoint: {
          connectOrCreate: {
            where: { id: data.startPoint?.id },
            create: {
              id: data.startPoint?.id,
              name: data.startPoint?.name,
              address: data.startPoint?.address ?? null,
              latitude: data.startPoint?.latitude,
              longitude: data.startPoint?.longitude,
              type: data.startPoint?.type,
            },
          },
        },
        endPoint: {
          connectOrCreate: {
            where: { id: data.endPoint?.id },
            create: {
              id: data.endPoint?.id,
              name: data.endPoint?.name,
              address: data.endPoint?.address ?? null,
              latitude: data.endPoint?.latitude,
              longitude: data.endPoint?.longitude,
              type: data.endPoint?.type,
            },
          },
        },
        // Fechas y otros campos
        plannedStartTimestamp: data.plannedStartTimestamp
          ? new Date(data.plannedStartTimestamp)
          : undefined,
        plannedEndTimestamp: data.plannedEndTimestamp
          ? new Date(data.plannedEndTimestamp)
          : undefined,
        plannedTotalTimeH: data.plannedTotalTimeH,
        plannedDriveTimeH: data.plannedDriveTimeH,
        plannedServiceTimeH: data.plannedServiceTimeH,
        plannedWaitTimeH: data.plannedWaitTimeH,
        plannedBreakTimeH: data.plannedBreakTimeH,
        plannedEndBreakTimeH: data.plannedEndBreakTimeH,
        plannedDistanceKm: data.plannedDistanceKm,
        actualStartTimestamp: data.actualStartTimestamp
          ? new Date(data.actualStartTimestamp)
          : undefined,
        actualEndTimestamp: data.actualEndTimestamp
          ? new Date(data.actualEndTimestamp)
          : undefined,
        startLatitude: data.startLatitude,
        startLongitude: data.startLongitude,
        endLatitude: data.endLatitude,
        endLongitude: data.endLongitude,
        batchId: data.batchId ?? null,
        enableTelematicsGps: data.enableTelematicsGps,
        enableAutoArrival: data.enableAutoArrival,
        enableAutoStart: data.enableAutoStart,
        numHelpers: data.numHelpers,
        // Nested write para las visitas
        visits: {
          create:
            data.visits?.map((visit: Visit) => ({
              id: visit.id ?? cuid(),
              sequence: visit.sequence ?? 0,
              customer: visit.customer
                ? {
                    connectOrCreate: {
                      where: { id: visit.customer.id },
                      create: {
                        id: visit.customer.id,
                        name: visit.customer.name,
                        phone: visit.customer.phone ?? null,
                        email: visit.customer.email ?? null,
                      },
                    },
                  }
                : undefined,
              ...(visit.address
                ? {
                    address: {
                      connectOrCreate: {
                        where: { id: visit.address.id },
                        create: {
                          id: visit.address.id,
                          label: visit.address.label ?? null,
                          address: visit.address.address,
                          latitude: visit.address.latitude,
                          longitude: visit.address.longitude,
                          contact: visit.address.contact ?? null,
                          phone: visit.address.phone ?? null,
                          notes: visit.address.notes ?? null,
                          businessType: visit.address.businessType,
                        },
                      },
                    },
                  }
                : {}),
              deliveryOrders: {
                create:
                  visit.orders?.map((order: Order) => ({
                    id: order.id ?? cuid(),
                    // La orden debe estar conectada al plan actual
                    plan: { connect: { id: data.id } },
                    customer: {
                      connectOrCreate: {
                        where: { id: order.customerId },
                        create: {
                          id: order.customerId,
                          name: order.customer?.name || "Nombre por defecto",
                          phone: order.customer?.phone ?? null,
                          email: order.customer?.email ?? null,
                        },
                      },
                    },
                    ...(order.addressId
                      ? { address: { connect: { id: order.addressId } } }
                      : {}),
                    // Conexión condicional para relaciones (no se envía el campo escalar salesRepresentativeId)
                    ...(order.salesRepresentativeId
                      ? {
                          salesRepresentative: {
                            connect: { id: order.salesRepresentativeId },
                          },
                        }
                      : {}),
                    serviceDate: new Date(order.serviceDate),
                    ...(order.orderGroupId
                      ? { orderGroup: { connect: { id: order.orderGroupId } } }
                      : {}),
                    ...(order.startPointId
                      ? { startPoint: { connect: { id: order.startPointId } } }
                      : {}),
                    ...(order.businessSegmentId
                      ? {
                          businessSegment: {
                            connect: { id: order.businessSegmentId },
                          },
                        }
                      : {}),
                    value: order.value,
                    volume: order.volume,
                    weight: order.weight,
                    cases: order.cases != null ? Math.round(order.cases) : 0,
                    requiresSignature: order.requiresSignature,
                    actualValue: order.actualValue ?? 0,
                    instructions: order.instructions ?? null,
                    notes: order.notes ?? null,
                    status: order.status ?? "pending",
                    statusConfirmed: order.statusConfirmed ?? null,
                    statusTimestamp: order.statusTimestamp
                      ? new Date(order.statusTimestamp)
                      : undefined,
                    // Nested write para los lineItems de la orden
                    lineItems: {
                      create:
                        order.lineItems?.map((li: LineItem) => ({
                          id: li.id ?? cuid(),
                          quantity: li.quantity,
                          unitPrice: li.unitPrice,
                          taxRate: li.taxRate,
                          value: li.value ?? 0,
                          actualQuantity: li.actualQuantity ?? 0,
                          actualValue: li.actualValue ?? 0,
                          lineNumber: li.lineNumber ?? 0,
                          status: li.status ?? "pending",
                          notes: li.notes ?? null,
                          // Se conecta o crea el producto según corresponda
                          product: li.product
                            ? {
                                connectOrCreate: {
                                  where: { id: li.product.id },
                                  create: {
                                    id: li.product.id,
                                    description: li.product.description,
                                  },
                                },
                              }
                            : undefined,
                          // Si se recibe un returnedReasonId, se conecta la relación
                          ...(li.returnedReasonId
                            ? {
                                returnedReason: {
                                  connect: { id: li.returnedReasonId },
                                },
                              }
                            : {}),
                        })) || [],
                    },
                  })) || [],
              },
            })) || [],
        },
      },
    });
    return plan;
  } catch (error) {
    console.error("Error al crear el plan:", error);
    throw new Error("Error al crear el plan.");
  }
};

// Delete a plan by ID
export const deletePlanById = async (id: string) => {
  return db.plan.delete({ where: { id } });
};

// -------- ROUTES AND ROUTE GROUPS-------- //

// Get route groups from the external service
export const getExternalRouteGroups = async (id?: string): Promise<any> => {
  const { ROUTE_GROUPS_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = id
    ? `${ROUTE_GROUPS_EXTERNAL_SERVICE_URL}/${id}`
    : ROUTE_GROUPS_EXTERNAL_SERVICE_URL;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get a route by ID from external service
export const getExternalRouteById = async (
  routeGroupId: string,
  routeId: string
): Promise<any> => {
  const { ROUTE_GROUPS_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = `${ROUTE_GROUPS_EXTERNAL_SERVICE_URL}/${routeGroupId}/routes/${routeId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get all routes from the database
export const fetchAllRouteGroups = async () => {
  try {
    const routes = await db.route.findMany({
      include: {
        routeGroup: true,
        stops: true,
        assignedTruck: true,
        assignedTruckType: true,
        plans: true,
      },
    });

    return routes.map((route) => ({
      id: route.id,
      routeGroupId: route.routeGroupId,
      routeGroup: route.routeGroup,
      startPointId: route.startPointId,
      endPointId: route.endPointId,
      assignedTruckId: route.assignedTruckId,
      assignedTruck: route.assignedTruck,
      assignedTruckTypeId: route.assignedTruckTypeId,
      assignedTruckType: route.assignedTruckType,
      assignedUserId: route.assignedUserId,
      stops: route.stops,
      plans: route.plans,
    }));
  } catch (error) {
    console.error("Error al consultar rutas en la base de datos:", error);
    throw new Error("Error al obtener las rutas.");
  }
};

// Get a route by ID from the database
export const fetchRouteByIdFromDB = async (id: string) => {
  try {
    return await db.route.findUnique({
      where: { id },
      include: {
        routeGroup: true,
        stops: true,
        assignedTruck: true,
        assignedTruckType: true,
        plans: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener ruta de la base de datos:", error);
    throw new Error("Error al consultar la base de datos.");
  }
};

// Get a route by route group ID
export const fetchRouteByID = async (routeGroupId: string, routeId: string) => {
  return db.route.findMany({
    where: { routeGroupId },
    include: {
      routeGroup: true,
      stops: true,
      assignedTruck: true,
      assignedTruckType: true,
      plans: true,
    },
  });
};

// Validate if a route group exists
export const routeExists = async (id: string) => {
  return db.route.findUnique({ where: { id } });
};

// create a new route group
export const createNewRouteGroup = async (
  data: z.infer<typeof RouteGroupSchema>
) => {
  try {
    const { routes, ...routeGroupData } = data;

    return await db.routeGroup.create({
      data: routeGroupData,
      include: {
        routes: true,
      },
    });
  } catch (error) {
    console.error("Error al crear el grupo de rutas:", error);
    throw new Error("Error al crear el grupo de rutas.");
  }
};

// Update a route group by ID
export const updateRouteGroupFromDB = async (
  id: string,
  data: z.infer<typeof RouteGroupSchema>
) => {
  try {
    const { routes, ...routeGroupData } = data;

    return db.routeGroup.update({
      where: { id },
      data: routeGroupData,
    });
  } catch (error) {
    console.error("Error al actualizar el grupo de rutas:", error);
    throw new Error("Error al actualizar el grupo de rutas.");
  }
};

// Delete a route group by ID
export const deleteRouteGroupById = async (id: string) => {
  return db.routeGroup.delete({ where: { id } });
};

// Delete a route by ID
export const deleteRouteById = async (id: string) => {
  return db.route.delete({ where: { id } });
};

// Handle external error
export const handleExternalAPIError = (error: any): null => {
  if (axios.isAxiosError(error)) {
    console.error("Error en API externa:", {
      status: error.response?.status,
      data: error.response?.data,
    });
  } else {
    console.error("Error desconocido:", error);
  }
  return null;
};

// Send a response
export const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  message: string,
  data?: any
) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};

// Validate password
export const validatePassword = (password: string, userPassword: string) => {
  return bcrypt.compare(password, userPassword);
};

// Hash password
export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};
