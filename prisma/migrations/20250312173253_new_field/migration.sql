-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('delivery', 'sales');

-- CreateEnum
CREATE TYPE "PointOfInterestType" AS ENUM ('distribution_center', 'warehouse', 'store', 'headquarters');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('cash', 'credit_card', 'credit_note', 'check', 'bank_transfer', 'other');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'in_progress', 'completed', 'delivered', 'partially_delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MANAGER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN DEFAULT true,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAttempt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointOfInterest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" "PointOfInterestType" NOT NULL,

    CONSTRAINT "PointOfInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "contact" TEXT,
    "businessType" TEXT NOT NULL,
    "customerId" TEXT,
    "firstDeliveryTimeWindowId" TEXT,
    "secondDeliveryTimeWindowId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeWindow" (
    "id" TEXT NOT NULL,
    "openingTime" TIMESTAMP(3) NOT NULL,
    "closingTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "BusinessSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activeDates" TIMESTAMP(3)[],
    "assignedUserId" TEXT,
    "businessSegmentId" TEXT,
    "routeId" TEXT,
    "truckId" TEXT,
    "truckTypeId" TEXT,
    "routeGroupId" TEXT,
    "startPointId" TEXT NOT NULL,
    "endPointId" TEXT NOT NULL,
    "plannedStartTimestamp" TIMESTAMP(3),
    "plannedEndTimestamp" TIMESTAMP(3),
    "plannedTotalTimeH" DOUBLE PRECISION,
    "plannedDriveTimeH" DOUBLE PRECISION,
    "plannedServiceTimeH" DOUBLE PRECISION,
    "plannedWaitTimeH" DOUBLE PRECISION,
    "plannedBreakTimeH" DOUBLE PRECISION,
    "plannedEndBreakTimeH" DOUBLE PRECISION,
    "plannedDistanceKm" DOUBLE PRECISION,
    "actualStartTimestamp" TIMESTAMP(3),
    "actualEndTimestamp" TIMESTAMP(3),
    "startLatitude" DOUBLE PRECISION,
    "startLongitude" DOUBLE PRECISION,
    "endLatitude" DOUBLE PRECISION,
    "endLongitude" DOUBLE PRECISION,
    "batchId" TEXT,
    "enableTelematicsGps" BOOLEAN NOT NULL,
    "enableAutoArrival" BOOLEAN NOT NULL,
    "enableAutoStart" BOOLEAN NOT NULL,
    "numHelpers" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "sequence" INTEGER,
    "planId" TEXT,
    "customerId" TEXT,
    "addressId" TEXT,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT,
    "salesRepresentativeId" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "orderGroupId" TEXT,
    "startPointId" TEXT,
    "businessSegmentId" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "cases" INTEGER,
    "instructions" TEXT,
    "requiresSignature" BOOLEAN NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "status" "OrderStatus" NOT NULL,
    "statusConfirmed" BOOLEAN,
    "statusTimestamp" TIMESTAMP(3),
    "deliveryVisitId" TEXT,
    "pickupVisitId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "productId" TEXT,
    "lineNumber" INTEGER,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION,
    "actualQuantity" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "returnedReasonId" TEXT,
    "notes" TEXT,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "method" "PaymentMethodType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "documentId" TEXT,
    "bankId" TEXT,
    "accountNumber" TEXT,
    "visitId" TEXT NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryReassignment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromDeliveryPlanId" TEXT NOT NULL,
    "fromOrderGroupId" TEXT,
    "toDeliveryPlanId" TEXT NOT NULL,
    "toOrderGroupId" TEXT,
    "orderValue" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "visitId" TEXT NOT NULL,

    CONSTRAINT "DeliveryReassignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesRepresentative" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SalesRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderGroup" (
    "id" TEXT NOT NULL,

    CONSTRAINT "OrderGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RouteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "routeGroupId" TEXT NOT NULL,
    "startPointId" TEXT NOT NULL,
    "endPointId" TEXT NOT NULL,
    "assignedTruckId" TEXT,
    "assignedTruckTypeId" TEXT,
    "assignedUserId" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "routeId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("routeId","sequence")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "truckTypeId" TEXT,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "maxCases" INTEGER NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "maxVolume" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "TruckType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reason" (
    "id" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelEs" TEXT NOT NULL,

    CONSTRAINT "Reason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_firstDeliveryTimeWindowId_fkey" FOREIGN KEY ("firstDeliveryTimeWindowId") REFERENCES "TimeWindow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_secondDeliveryTimeWindowId_fkey" FOREIGN KEY ("secondDeliveryTimeWindowId") REFERENCES "TimeWindow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_startPointId_fkey" FOREIGN KEY ("startPointId") REFERENCES "PointOfInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_endPointId_fkey" FOREIGN KEY ("endPointId") REFERENCES "PointOfInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_salesRepresentativeId_fkey" FOREIGN KEY ("salesRepresentativeId") REFERENCES "SalesRepresentative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderGroupId_fkey" FOREIGN KEY ("orderGroupId") REFERENCES "OrderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryVisitId_fkey" FOREIGN KEY ("deliveryVisitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupVisitId_fkey" FOREIGN KEY ("pickupVisitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_returnedReasonId_fkey" FOREIGN KEY ("returnedReasonId") REFERENCES "Reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReassignment" ADD CONSTRAINT "DeliveryReassignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReassignment" ADD CONSTRAINT "DeliveryReassignment_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_routeGroupId_fkey" FOREIGN KEY ("routeGroupId") REFERENCES "RouteGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_startPointId_fkey" FOREIGN KEY ("startPointId") REFERENCES "PointOfInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_endPointId_fkey" FOREIGN KEY ("endPointId") REFERENCES "PointOfInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assignedTruckId_fkey" FOREIGN KEY ("assignedTruckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_assignedTruckTypeId_fkey" FOREIGN KEY ("assignedTruckTypeId") REFERENCES "TruckType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Truck" ADD CONSTRAINT "Truck_truckTypeId_fkey" FOREIGN KEY ("truckTypeId") REFERENCES "TruckType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
