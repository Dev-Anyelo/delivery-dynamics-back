import { db } from "./db";

// Get drivers
export const getDrivers = async () => {
  try {
    const drivers = await db.driver.findMany();

    return drivers;
  } catch (error) {
    console.log(error);
  }
};