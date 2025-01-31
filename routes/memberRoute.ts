import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import { memberSchema } from "../utils/schema";

const router = express.Router();

router.post("/", validateRequest(memberSchema), memberController.createMember);
