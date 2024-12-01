import { Router } from "express";
//controller


const router = Router();

router.get("/api/routes");
router.get("/api/route/:id");
router.post("/api/route/update/:id");
router.delete("/api/route/delete/:id");


export default router;