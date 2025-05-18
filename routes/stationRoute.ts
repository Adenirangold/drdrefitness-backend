import express from "express";

import validateRequest from "../middleware/validation";
import { stationSchema } from "../utils/schema";
import {
  createStation,
  deleteStationById,
  getAdminStation,
  getAllStations,
} from "../controller/stationController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",
  validateRequest(stationSchema),
  autheticateMember("director"),
  createStation
);
router.get("/", autheticateMember("director"), getAllStations);
router.delete("/:id", autheticateMember("director"), deleteStationById);
router.get("/admin", autheticateMember("admin"), getAdminStation);

export default router;
